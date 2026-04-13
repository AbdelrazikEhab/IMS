import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin and default data...');

  // 1. Create Default Super Admin Tenant
  let superAdminTenant = await prisma.tenant.findUnique({
    where: { subdomain: 'admin' },
  });

  if (!superAdminTenant) {
    superAdminTenant = await prisma.tenant.create({
      data: {
        subdomain: 'admin',
        name: 'Super Admin Platform',
        type: 'SCHOOL' as any,
        status: 'ACTIVE' as any,
        plan: 'ENTERPRISE' as any,
      },
    });
  }

  // 2. Create Super Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  let superAdmin = await prisma.user.findFirst({
    where: {
      tenant_id: superAdminTenant.id,
      email: 'admin@system.local',
    },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        tenant_id: superAdminTenant.id,
        email: 'admin@system.local',
        password_hash: adminPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'SUPER_ADMIN' as any,
        is_active: true,
        is_verified: true,
      },
    });
  }

  console.log('Super Admin user created:', superAdmin.email);

  // 3. Create Default School Tenant
  let defaultSchool = await prisma.tenant.findUnique({
    where: { subdomain: 'myschool' },
  });

  if (!defaultSchool) {
    defaultSchool = await prisma.tenant.create({
      data: {
        subdomain: 'myschool',
        name: 'My Default School',
        type: 'SCHOOL' as any,
        status: 'ACTIVE' as any,
        plan: 'SCHOOL_PRO' as any,
      },
    });
  }

  // 4. Create School Admin User
  let schoolAdmin = await prisma.user.findFirst({
    where: {
      tenant_id: defaultSchool.id,
      email: 'schooladmin@myschool.local',
    },
  });

  if (!schoolAdmin) {
    schoolAdmin = await prisma.user.create({
      data: {
        tenant_id: defaultSchool.id,
        email: 'schooladmin@myschool.local',
        password_hash: adminPassword,
        first_name: 'School',
        last_name: 'Admin',
        role: 'SCHOOL_ADMIN' as any,
        is_active: true,
        is_verified: true,
      },
    });
  }

  console.log('School Admin user created:', schoolAdmin.email);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
