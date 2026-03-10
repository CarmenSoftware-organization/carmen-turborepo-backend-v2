#!/usr/bin/env python3
"""
Generate Bruno collection files from Swagger JSON.
Usage: python3 scripts/generate-bruno.py
"""

import json
import os
import re
import sys

SWAGGER_PATH = "apps/backend-gateway/swagger.json"
BRUNO_OUTPUT = "apps/bruno/carmen-inventory"

def sanitize_folder_name(name: str) -> str:
    """Remove or replace chars that are problematic in folder/file names."""
    name = name.replace("/", "-").replace("\\", "-")
    # Remove chars not allowed in filenames
    name = re.sub(r'[<>:"|?*]', '', name)
    return name.strip()

def sanitize_file_name(name: str) -> str:
    name = name.replace("/", "-").replace("\\", "-")
    name = re.sub(r'[<>:"|?*]', '', name)
    return name.strip()

def method_to_body(method: str) -> str:
    if method in ("post", "put", "patch"):
        return "json"
    return "none"

def needs_auth(details: dict) -> bool:
    security = details.get("security", [])
    if not security:
        return False
    for s in security:
        # Empty dict {} means no auth required
        if not s:
            return False
        if "bearerAuth" in s or "bearer" in s:
            return True
    return True  # Default to auth if security is present

def build_query_params(parameters: list) -> list:
    """Extract query parameters from Swagger parameters."""
    params = []
    for p in parameters:
        if p.get("in") == "query":
            name = p.get("name", "")
            required = p.get("required", False)
            schema = p.get("schema", {})
            default = schema.get("default", "")
            example = schema.get("example", default)
            if example is None:
                example = ""
            params.append({
                "name": name,
                "value": str(example) if example else "",
                "required": required,
            })
    return params

def build_request_body(details: dict, spec: dict) -> str:
    """Build example JSON body from requestBody schema."""
    req_body = details.get("requestBody", {})
    if not req_body:
        return ""

    content = req_body.get("content", {})
    json_content = content.get("application/json", {})
    schema = json_content.get("schema", {})

    # Handle $ref
    if "$ref" in schema:
        schema = resolve_ref(schema["$ref"], spec)

    example = generate_example(schema, spec)
    if example:
        return json.dumps(example, indent=2)
    return "{\n\n}"

def resolve_ref(ref: str, spec: dict) -> dict:
    """Resolve a $ref pointer."""
    parts = ref.lstrip("#/").split("/")
    obj = spec
    for part in parts:
        obj = obj.get(part, {})
    return obj

def generate_example(schema: dict, spec: dict, depth: int = 0) -> any:
    """Generate an example value from a schema."""
    if depth > 5:
        return {}

    if "$ref" in schema:
        schema = resolve_ref(schema["$ref"], spec)

    if "example" in schema:
        return schema["example"]

    schema_type = schema.get("type", "object")

    if schema_type == "string":
        fmt = schema.get("format", "")
        enum = schema.get("enum")
        if enum:
            return enum[0]
        if fmt == "date-time":
            return "2026-01-01T00:00:00.000Z"
        if fmt == "date":
            return "2026-01-01"
        if fmt == "email":
            return "user@example.com"
        if fmt == "uuid":
            return "00000000-0000-0000-0000-000000000000"
        min_len = schema.get("minLength", 0)
        return "string"

    if schema_type == "number" or schema_type == "integer":
        return schema.get("minimum", 0)

    if schema_type == "boolean":
        return True

    if schema_type == "array":
        items = schema.get("items", {})
        item_example = generate_example(items, spec, depth + 1)
        return [item_example] if item_example is not None else []

    if schema_type == "object" or "properties" in schema:
        props = schema.get("properties", {})
        required = schema.get("required", [])
        result = {}
        for prop_name, prop_schema in props.items():
            result[prop_name] = generate_example(prop_schema, spec, depth + 1)
        return result if result else {}

    # allOf
    if "allOf" in schema:
        merged = {}
        for sub in schema["allOf"]:
            example = generate_example(sub, spec, depth + 1)
            if isinstance(example, dict):
                merged.update(example)
        return merged

    return {}

def build_url(path: str, parameters: list) -> str:
    """Build URL with path parameters replaced by Bruno variables."""
    url = path
    for p in parameters:
        if p.get("in") == "path":
            name = p.get("name", "")
            url = url.replace("{" + name + "}", "{{" + name + "}}")
    return "{{host}}" + url

def generate_bru_file(
    name: str,
    seq: int,
    method: str,
    url: str,
    auth: bool,
    query_params: list,
    body: str,
    has_body: bool,
    has_x_app_id: bool = False,
    is_login: bool = False,
) -> str:
    """Generate Bruno .bru file content."""
    lines = []

    # Meta
    lines.append("meta {")
    lines.append(f"  name: {name}")
    lines.append("  type: http")
    lines.append(f"  seq: {seq}")
    lines.append("}")
    lines.append("")

    # Method block
    body_type = "json" if has_body else "none"
    auth_type = "bearer" if auth else "none"
    lines.append(f"{method} {{")
    lines.append(f"  url: {url}")
    lines.append(f"  body: {body_type}")
    lines.append(f"  auth: {auth_type}")
    lines.append("}")

    # Headers
    if has_x_app_id:
        lines.append("")
        lines.append("headers {")
        lines.append("  x-app-id: {{x_app_id}}")
        lines.append("}")

    # Query params
    if query_params:
        lines.append("")
        lines.append("params:query {")
        for qp in query_params:
            prefix = "" if qp["required"] else "~"
            lines.append(f"  {prefix}{qp['name']}: {qp['value']}")
        lines.append("}")

    # Auth
    if auth:
        lines.append("")
        lines.append("auth:bearer {")
        lines.append("  token: {{access_token}}")
        lines.append("}")

    # Body
    if has_body and body:
        lines.append("")
        lines.append("body:json {")
        lines.append(f"  {body}")
        lines.append("}")

    # Login post-response script to save tokens
    if is_login:
        lines.append("")
        lines.append("script:post-response {")
        lines.append("  bru.setEnvVar('access_token',res.body.access_token);")
        lines.append("  bru.setEnvVar('refresh_token',res.body.refresh_token);")
        lines.append("}")

    lines.append("")
    return "\n".join(lines)


def main():
    with open(SWAGGER_PATH, "r") as f:
        spec = json.load(f)

    paths = spec.get("paths", {})

    # Group endpoints by tag
    tag_endpoints = {}
    for path, methods in paths.items():
        for method, details in methods.items():
            if method in ("parameters",):
                continue
            tags = details.get("tags", ["Uncategorized"])
            tag = tags[0] if tags else "Uncategorized"

            if tag not in tag_endpoints:
                tag_endpoints[tag] = []

            tag_endpoints[tag].append({
                "path": path,
                "method": method,
                "details": details,
            })

    # Sort tags with priority ordering: Auth/Register first, then alphabetical
    TAG_PRIORITY = [
        "Authentication",
        "Register",
    ]

    def tag_sort_key(tag: str) -> tuple:
        try:
            idx = TAG_PRIORITY.index(tag)
            return (0, idx, tag)
        except ValueError:
            return (1, 0, tag)

    sorted_tags = sorted(tag_endpoints.keys(), key=tag_sort_key)

    # Track generated folders for numbering
    tag_folder_map = {}
    folder_seq = 60  # Start after existing folders (up to 56 + some gaps)

    # Count existing folders to find the right starting number
    existing_dirs = []
    if os.path.exists(BRUNO_OUTPUT):
        for d in os.listdir(BRUNO_OUTPUT):
            full = os.path.join(BRUNO_OUTPUT, d)
            if os.path.isdir(full) and d != "environments":
                existing_dirs.append(d)

    # Parse existing folder numbers
    existing_numbers = set()
    existing_tag_map = {}
    for d in existing_dirs:
        match = re.match(r'^(\d+)\s*-\s*(.+)$', d)
        if match:
            num = int(match.group(1))
            existing_numbers.add(num)
            existing_tag_map[d] = num

    if existing_numbers:
        folder_seq = max(existing_numbers) + 1

    generated_count = 0
    skipped_count = 0

    for tag in sorted_tags:
        endpoints = tag_endpoints[tag]
        folder_name = sanitize_folder_name(tag)

        # Check if a similar folder already exists
        existing_folder = None
        for d in existing_dirs:
            # Strip the number prefix for comparison
            match = re.match(r'^\d+\s*-\s*(.+)$', d)
            if match:
                name_part = match.group(1).strip()
                if name_part.lower() == folder_name.lower():
                    existing_folder = d
                    break

        if existing_folder:
            folder_path = os.path.join(BRUNO_OUTPUT, existing_folder)
            display_name = existing_folder
        else:
            numbered_name = f"{folder_seq:02d} - {folder_name}"
            folder_path = os.path.join(BRUNO_OUTPUT, numbered_name)
            display_name = numbered_name
            folder_seq += 1

        os.makedirs(folder_path, exist_ok=True)

        # Create folder.bru if it doesn't exist
        folder_bru = os.path.join(folder_path, "folder.bru")
        if not os.path.exists(folder_bru):
            with open(folder_bru, "w") as f:
                f.write(f"meta {{\n  name: {display_name}\n  type: folder\n}}\n")

        # Sort endpoints: prioritize login/register first, then GET, POST, PUT, PATCH, DELETE
        ENDPOINT_PRIORITY = [
            "/api/auth/login",
            "/api/auth/refresh-token",
            "/api/auth/logout",
            "/api/auth/register-confirm",
            "/api/auth/invite-user",
        ]

        def endpoint_sort_key(e):
            path = e["path"]
            method = e["method"]
            # Check priority list
            try:
                idx = ENDPOINT_PRIORITY.index(path)
                return (0, idx, path)
            except ValueError:
                pass
            method_order = {"get": 0, "post": 1, "put": 2, "patch": 3, "delete": 4}
            return (1, method_order.get(method, 5), path)

        endpoints.sort(key=endpoint_sort_key)

        for seq_idx, ep in enumerate(endpoints, 1):
            method = ep["method"]
            details = ep["details"]
            path = ep["path"]
            parameters = details.get("parameters", [])

            # Build operation name
            op_id = details.get("operationId", "")
            summary = details.get("summary", "")

            # Create a readable name
            if summary:
                req_name = summary
            elif op_id:
                # Convert operationId to readable name
                req_name = op_id.split("_")[-1] if "_" in op_id else op_id
                # camelCase to spaces
                req_name = re.sub(r'([a-z])([A-Z])', r'\1 \2', req_name)
            else:
                req_name = f"{method.upper()} {path}"

            file_name = f"{seq_idx:02d} - {sanitize_file_name(req_name)}"
            file_path = os.path.join(folder_path, f"{file_name}.bru")

            # Skip if file already exists
            if os.path.exists(file_path):
                skipped_count += 1
                continue

            # Build URL
            url = build_url(path, parameters)

            # Query params
            query_params = build_query_params(parameters)

            # Auth
            auth = needs_auth(details)

            # Body
            has_body = method in ("post", "put", "patch")
            body = ""
            if has_body:
                body = build_request_body(details, spec)

            # Detect x-app-id header parameter
            has_x_app_id = any(
                p.get("in") == "header" and p.get("name") == "x-app-id"
                for p in parameters
            )

            # Detect login endpoint
            is_login = path == "/api/auth/login" and method == "post"

            # Generate .bru content
            bru_content = generate_bru_file(
                name=f"{seq_idx:02d} - {req_name}",
                seq=seq_idx,
                method=method,
                url=url,
                auth=auth,
                query_params=query_params,
                body=body,
                has_body=has_body,
                has_x_app_id=has_x_app_id,
                is_login=is_login,
            )

            with open(file_path, "w") as f:
                f.write(bru_content)

            generated_count += 1

    print(f"Generated: {generated_count} files")
    print(f"Skipped (already exist): {skipped_count} files")
    print(f"Total tags/folders: {len(sorted_tags)}")

if __name__ == "__main__":
    main()
