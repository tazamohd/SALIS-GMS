/**
 * SALIS AUTO - RBAC Seeding Script
 * 
 * This script populates the database with all standard roles and permissions
 * based on the RBAC configuration.
 */

import { db } from './db';
import { permissions, roles, rolePermissions } from '@shared/schema';
import {
  RESOURCES,
  STANDARD_ROLES,
  ROLE_PERMISSIONS,
  getAllActionKeys,
} from './rbac-config';
import { eq, and } from 'drizzle-orm';

type Permission = typeof permissions.$inferSelect;
type Role = typeof roles.$inferSelect;

/**
 * Seed all permissions into the database
 */
export async function seedPermissions(): Promise<Map<string, Permission>> {
  console.log('🔐 Seeding permissions...');
  
  const permissionMap = new Map<string, Permission>();
  const permissionsToCreate: Array<typeof permissions.$inferInsert> = [];
  
  // Generate all possible permission combinations
  for (const [resourceKey, resourceData] of Object.entries(RESOURCES)) {
    for (const action of getAllActionKeys()) {
      const permissionKey = `${resourceKey}:${action}`;
      
      permissionsToCreate.push({
        resource: resourceKey,
        action,
        description: `${action} ${resourceData.label}`,
        category: resourceData.category,
        isSystemPermission: true,
      });
    }
  }
  
  // Also add wildcard permissions
  permissionsToCreate.push({
    resource: '*',
    action: '*',
    description: 'Full system access (wildcard)',
    category: 'System Administration',
    isSystemPermission: true,
  });
  
  console.log(`📝 Creating ${permissionsToCreate.length} permissions...`);
  
  // Batch insert permissions
  for (const permData of permissionsToCreate) {
    try {
      // Check if permission already exists
      const existing = await db
        .select()
        .from(permissions)
        .where(and(
          eq(permissions.resource, permData.resource),
          eq(permissions.action, permData.action)
        ))
        .limit(1);
      
      let permission: Permission;
      
      if (existing.length > 0) {
        permission = existing[0];
      } else {
        const inserted = await db
          .insert(permissions)
          .values(permData)
          .returning();
        permission = inserted[0];
      }
      
      const key = `${permData.resource}:${permData.action}`;
      permissionMap.set(key, permission);
    } catch (error) {
      console.error(`Error creating permission ${permData.resource}:${permData.action}:`, error);
    }
  }
  
  console.log(`✅ Created/found ${permissionMap.size} permissions`);
  return permissionMap;
}

/**
 * Seed all standard roles into the database
 */
export async function seedRoles(): Promise<Map<string, Role>> {
  console.log('👥 Seeding standard roles...');
  
  const roleMap = new Map<string, Role>();
  
  for (const [roleKey, roleData] of Object.entries(STANDARD_ROLES)) {
    try {
      // Check if role already exists
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name))
        .limit(1);
      
      let role: Role;
      
      if (existing.length > 0) {
        role = existing[0];
        // Update role if needed
        await db
          .update(roles)
          .set({
            scope: roleData.scope,
            isSystemRole: roleData.isSystemRole,
          })
          .where(eq(roles.id, role.id));
      } else {
        const inserted = await db
          .insert(roles)
          .values({
            name: roleData.name,
            scope: roleData.scope,
            isSystemRole: roleData.isSystemRole,
          })
          .returning();
        role = inserted[0];
      }
      
      roleMap.set(roleKey, role);
      console.log(`  ✓ ${roleData.name}`);
    } catch (error) {
      console.error(`Error creating role ${roleData.name}:`, error);
    }
  }
  
  console.log(`✅ Created/found ${roleMap.size} roles`);
  return roleMap;
}

/**
 * Map permissions to roles based on the permission matrix
 */
export async function seedRolePermissions(
  roleMap: Map<string, Role>,
  permissionMap: Map<string, Permission>
): Promise<void> {
  console.log('🔗 Mapping permissions to roles...');
  
  let totalMappings = 0;
  
  for (const [roleKey, rolePermissionData] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap.get(roleKey);
    if (!role) {
      console.warn(`⚠️  Role ${roleKey} not found in roleMap, skipping...`);
      continue;
    }
    
    console.log(`  Processing ${STANDARD_ROLES[roleKey as keyof typeof STANDARD_ROLES].name}...`);
    
    const { resources } = rolePermissionData;
    
    // Handle wildcard permission (System Admin)
    if (resources['*'] && resources['*'].includes('*')) {
      const wildcardPermission = permissionMap.get('*:*');
      if (wildcardPermission) {
        try {
          // Check if mapping already exists
          const existing = await db
            .select()
            .from(rolePermissions)
            .where(and(
              eq(rolePermissions.roleId, role.id),
              eq(rolePermissions.permissionId, wildcardPermission.id)
            ))
            .limit(1);
          
          if (existing.length === 0) {
            await db.insert(rolePermissions).values({
              roleId: role.id,
              permissionId: wildcardPermission.id,
              granted: true,
            });
            totalMappings++;
          }
        } catch (error) {
          console.error(`Error creating wildcard role permission mapping:`, error);
        }
      }
      continue;
    }
    
    // Map specific resource permissions
    for (const [resourceKey, actions] of Object.entries(resources)) {
      for (const action of actions) {
        const permissionKey = `${resourceKey}:${action}`;
        const permission = permissionMap.get(permissionKey);
        
        if (!permission) {
          console.warn(`⚠️  Permission ${permissionKey} not found, skipping...`);
          continue;
        }
        
        try {
          // Check if mapping already exists
          const existing = await db
            .select()
            .from(rolePermissions)
            .where(and(
              eq(rolePermissions.roleId, role.id),
              eq(rolePermissions.permissionId, permission.id)
            ))
            .limit(1);
          
          if (existing.length === 0) {
            await db.insert(rolePermissions).values({
              roleId: role.id,
              permissionId: permission.id,
              granted: true,
            });
            totalMappings++;
          }
        } catch (error) {
          console.error(`Error creating role permission mapping for ${roleKey}:${permissionKey}:`, error);
        }
      }
    }
    
    console.log(`    ✓ Mapped permissions for ${STANDARD_ROLES[roleKey as keyof typeof STANDARD_ROLES].name}`);
  }
  
  console.log(`✅ Created ${totalMappings} role-permission mappings`);
}

/**
 * Main seed function - seeds all RBAC data
 */
export async function seedRBAC(): Promise<void> {
  console.log('🚀 Starting RBAC seeding...\n');
  
  try {
    // Step 1: Seed permissions
    const permissionMap = await seedPermissions();
    console.log('');
    
    // Step 2: Seed roles
    const roleMap = await seedRoles();
    console.log('');
    
    // Step 3: Map permissions to roles
    await seedRolePermissions(roleMap, permissionMap);
    console.log('');
    
    console.log('🎉 RBAC seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${permissionMap.size} permissions`);
    console.log(`  - ${roleMap.size} roles`);
    console.log(`  - ${STANDARD_ROLES.SYSTEM_ADMIN.name}: Full access`);
    console.log(`  - ${STANDARD_ROLES.OWNER.name}: Full business access`);
    console.log(`  - ${STANDARD_ROLES.GENERAL_MANAGER.name}: Management access`);
    console.log(`  - ${STANDARD_ROLES.SERVICE_MANAGER.name}: Service operations`);
    console.log(`  - ${STANDARD_ROLES.TECHNICIAN.name}: Technical work`);
    console.log(`  - And ${roleMap.size - 5} more roles...\n`);
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  }
}

// If run directly, execute the seed
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRBAC()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
