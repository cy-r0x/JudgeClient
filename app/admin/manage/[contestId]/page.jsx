"use client";

import { use } from "react";
import { withRole } from "@/components/HOC/withAuth";
import { USER_ROLES } from "@/utils/constants";
import ContestManageComponent from "@/components/ContestManageComponent/ContestManageComponent";

function ManageContest({ params }) {
  const { contestId } = use(params);

  return (
    <div>
      <ContestManageComponent contestId={contestId} />
    </div>
  );
}

export default withRole(ManageContest, USER_ROLES.ADMIN);
