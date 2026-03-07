"use client";

import { AuthButton } from "@/components/auth/auth-button";
import { Trash2, Edit, Shield, Eye } from "lucide-react";

/**
 * AuthButton Examples and Usage Guide
 * 
 * This demonstrates how to use the new AuthButton component
 * for permission-based action buttons throughout the application
 */

export function AuthButtonExamples() {
  const mockUser = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    role: "admin",
    is_current_user: false,
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-3">AuthButton Examples</h2>

        {/* Role-based checks */}
        <div className="space-y-3 mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">1. Role-Based Access</h3>
          
          {/* Single role */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Single Role (admin only):</p>
            <AuthButton
              roles="admin"
              icon={<Edit className="size-4" />}
              onClick={() => alert("Edit action")}
            >
              Edit User
            </AuthButton>
          </div>

          {/* Multiple roles (ANY) */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Multiple Roles (admin OR teacher):</p>
            <AuthButton
              roles={["admin", "teacher"]}
              icon={<Shield className="size-4" />}
              onClick={() => alert("Manage action")}
            >
              Manage Users
            </AuthButton>
          </div>

          {/* Hide when no permission (default) */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Hide when no permission (default):</p>
            <div className="p-2 bg-white rounded border">
              <AuthButton
                roles="superadmin"
                icon={<Trash2 className="size-4" />}
                variant="destructive"
                onClick={() => alert("Delete action")}
              >
                Delete System Data
              </AuthButton>
              <p className="text-xs text-gray-500 mt-2">
                (Hidden if you are not superadmin)
              </p>
            </div>
          </div>
        </div>

        {/* Disable instead of hide */}
        <div className="space-y-3 mb-6 p-4 bg-amber-50 rounded-lg">
          <h3 className="font-medium text-amber-900">2. Disable Instead of Hide</h3>
          <p className="text-sm text-gray-600 mb-3">
            Use <code className="bg-white px-2 py-1 rounded">disable</code> to show disabled button:
          </p>

          <AuthButton
            roles="superadmin"
            disable
            icon={<Shield className="size-4" />}
            onClick={() => alert("Disabled action")}
          >
            Superadmin Only Action
          </AuthButton>
          <p className="text-xs text-gray-500 mt-2">
            (Button is disabled if you are not superadmin)
          </p>
        </div>

        {/* Inverse role check */}
        <div className="space-y-3 mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900">3. Inverse Role Check</h3>
          <p className="text-sm text-gray-600 mb-3">
            Show only if user does NOT have a role:
          </p>

          <AuthButton
            notRoles="superadmin"
            icon={<Eye className="size-4" />}
            onClick={() => alert("Non-superadmin action")}
          >
            Regular User Action
          </AuthButton>
          <p className="text-xs text-gray-500 mt-2">
            (Hidden if you are superadmin)
          </p>
        </div>

        {/* Current user check */}
        <div className="space-y-3 mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-900">4. Current User Check</h3>
          <p className="text-sm text-gray-600 mb-3">
            Show only if viewing the logged-in user:
          </p>

          <AuthButton
            targetUser={mockUser}
            icon={<Edit className="size-4" />}
            variant="outline"
            onClick={() => alert("Edit own profile")}
          >
            Edit Your Profile
          </AuthButton>
          <p className="text-xs text-gray-500 mt-2">
            (Only shows if viewing your own profile)
          </p>
        </div>

        {/* Fallback content */}
        <div className="space-y-3 mb-6 p-4 bg-red-50 rounded-lg">
          <h3 className="font-medium text-red-900">5. Fallback Content</h3>
          <p className="text-sm text-gray-600 mb-3">
            Show custom fallback when no permission:
          </p>

          <AuthButton
            roles="superadmin"
            fallback={
              <div className="inline-block px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded">
                This action requires superadmin privileges
              </div>
            }
            icon={<Shield className="size-4" />}
            onClick={() => alert("Admin action")}
          >
            Superadmin Action
          </AuthButton>
        </div>

        {/* Usage guide */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">How to Replace Existing Buttons</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Before:</strong> Manually checking permissions in render logic
            </p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {`{currentUser?.role === 'admin' && (
  <Button onClick={handleDelete}>Delete</Button>
)}`}
            </pre>

            <p className="mt-3">
              <strong>After:</strong> Using AuthButton component
            </p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {`<AuthButton 
  roles="admin" 
  onClick={handleDelete}
>
  Delete
</AuthButton>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
