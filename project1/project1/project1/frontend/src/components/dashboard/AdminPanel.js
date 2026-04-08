import React, { useState } from "react";
const AdminUserList = React.lazy(() => import("./AdminUserList"));
const AdminInterviewScheduler = React.lazy(() => import("./AdminInterviewScheduler"));
const UserHistory = React.lazy(() => import("./UserHistory"));

export default function AdminPanel() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div>
      <React.Suspense fallback={<div>Loading users...</div>}>
        <AdminUserList onSelectUser={setSelectedUser} />
      </React.Suspense>
      {selectedUser && (
        <>
          <React.Suspense fallback={<div>Loading interview scheduler...</div>}>
            <AdminInterviewScheduler selectedUser={selectedUser} />
          </React.Suspense>
          <React.Suspense fallback={<div>Loading user history...</div>}>
            <UserHistory email={selectedUser} />
          </React.Suspense>
        </>
      )}
    </div>
  );
}
