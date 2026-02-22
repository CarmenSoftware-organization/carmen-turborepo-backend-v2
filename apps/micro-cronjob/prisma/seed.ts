import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // สร้าง test users
  const user1 = await prisma.user.upsert({
    where: { id: 'user1' },
    update: {},
    create: {
      id: 'user1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password: 'password123',
      role: 'admin',
      isOnline: false
    }
  })

  const user2 = await prisma.user.upsert({
    where: { id: 'user2' },
    update: {},
    create: {
      id: 'user2',
      email: 'bob@example.com',
      name: 'Bob Smith',
      password: 'password456',
      role: 'user',
      isOnline: true
    }
  })

  const user3 = await prisma.user.upsert({
    where: { id: 'user3' },
    update: {},
    create: {
      id: 'user3',
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      password: 'password789',
      role: 'user',
      isOnline: false
    }
  })

  // System Notifications (ส่งให้ทุกคน)
  const systemMessages = [
    {
      title: 'ยินดีต้อนรับ!',
      message: 'ขอบคุณที่เข้าร่วมกับเรา เราหวังว่าคุณจะมีประสบการณ์ที่ดี',
      type: 'success'
    },
    {
      title: 'การบำรุงรักษาระบบ',
      message: 'ระบบจะมีการบำรุงรักษาในวันอาทิตย์ที่ 25 ก.ย. เวลา 02:00-04:00 น.',
      type: 'warning'
    },
    {
      title: 'อัปเดตความปลอดภัย',
      message: 'เราได้อัปเดตระบบความปลอดภัยเพื่อปกป้องข้อมูลของคุณให้ดียิ่งขึ้น',
      type: 'info'
    }
  ]

  // สร้าง default cron jobs
  const defaultCronJobs = [
    {
      name: 'notification_check',
      description: 'Check and send scheduled notifications every minute',
      cronExpression: '* * * * *', // every minute
      jobType: 'notification_check',
      isActive: true,
      createdBy: user1.id // admin user
    },
    {
      name: 'daily_summary',
      description: 'Send daily summary at 9:00 AM',
      cronExpression: '0 9 * * *', // daily at 9 AM
      jobType: 'daily_summary',
      isActive: true,
      createdBy: user1.id // admin user
    },
    {
      name: 'weekly_cleanup',
      description: 'Weekly cleanup of read notifications (inactive by default)',
      cronExpression: '0 2 * * 0', // every Sunday at 2 AM
      jobType: 'custom',
      jobData: JSON.stringify({ action: 'cleanup', type: 'read_notifications', olderThan: '7days' }),
      isActive: false,
      createdBy: user1.id // admin user
    }
  ]

  for (const cronJob of defaultCronJobs) {
    await prisma.cronJob.upsert({
      where: { name: cronJob.name },
      update: {},
      create: cronJob
    })
  }

  // สร้างสถิติ
  const totalUsers = await prisma.user.count()
  const totalCronJobs = await prisma.cronJob.count()
  const activeCronJobs = await prisma.cronJob.count({
    where: { isActive: true }
  })

}

main()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })