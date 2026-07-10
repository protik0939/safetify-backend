import { prisma } from "../../lib/prisma";

const getLatestVersion = async () => {
  const latestVersion = await prisma.appVersion.findFirst({
    where: {
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return latestVersion;
};

export const AppVersionService = {
  getLatestVersion,
};
