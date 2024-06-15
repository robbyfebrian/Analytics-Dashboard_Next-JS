import BarChart from "@/components/barchart";
import {
  DashBoardCard,
  DashboardCartContent,
} from "@/components/dashboard-card";
import GoalDataContent from "@/components/goal-progress";
import LineGraph from "@/components/line-chart";
import UserDataContent, { UserDataProps } from "@/components/user-data-card";
import UserPurchaseContent, {
  UserPurchaseProps,
} from "@/components/user-purchase-card";
import { db } from "@/lib/db";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  formatDistanceToNow,
  startOfMonth,
} from "date-fns";
import {
  Calendar,
  CreditCard,
  DollarSign,
  PersonStanding,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";

export default async function Dashboard() {
  const currentDate = new Date();

  const userCount = await db.user.count();

  const userCountMonth = await db.user.count({
    where: {
      createdAt: {
        gte: startOfMonth(currentDate),
        lte: endOfMonth(currentDate),
      },
    },
  });

  const salesCount = await db.purchase.count();

  const salesTotal = await db.purchase.aggregate({
    _sum: {
      amount: true,
    },
  });

  const totalAmount = salesTotal._sum.amount || 0;

  const goalAmount = 1000;
  const goalProgress = (totalAmount / goalAmount) * 100;

  const recentUsers = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
  });

  const UserData: UserDataProps[] = recentUsers.map((account) => ({
    name: account.name || "Unknown",
    email: account.email || "Unknown",
    image: account.image || "./mesh-gradient.png",
    time: formatDistanceToNow(new Date(account.createdAt), { addSuffix: true }),
  }));

  const recentSales = await db.purchase.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
    include: {
      user: true,
    },
  });

  const UserPurchase: UserPurchaseProps[] = recentSales.map((purchase) => ({
    name: purchase.user.name || "Unknown",
    email: purchase.user.email || "Unknown",
    image: purchase.user.image || "./mesh-gradient.png",
    purchaseAmount: `$${purchase.amount.toFixed(2)}`,
  }));

  const usersThisMonth = await db.user.groupBy({
    by: ["createdAt"],
    _count: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const monthlyUsersData = eachMonthOfInterval({
    start: startOfMonth(new Date(usersThisMonth[0]?.createdAt || new Date())),
    end: endOfMonth(currentDate),
  }).map((month) => {
    const monthString = format(month, "MMM");
    const userMonthly = usersThisMonth
      .filter((user) => format(new Date(user.createdAt), "MMM") === monthString)
      .reduce((total, user) => total + user._count.createdAt, 0);
    return { month: monthString, total: userMonthly };
  });

  const salesThisMonth = await db.purchase.groupBy({
    by: ["createdAt"],
    _sum: {
      amount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const monthlySalesData = eachMonthOfInterval({
    start: startOfMonth(new Date(salesThisMonth[0]?.createdAt || new Date())),
    end: endOfMonth(currentDate),
  }).map((month) => {
    const monthString = format(month, "MMM");
    const salesInMonth = salesThisMonth
      .filter(
        (sales) => format(new Date(sales.createdAt), "MMM") === monthString
      )
      .reduce((total, sale) => total + sale._sum.amount!, 0);
    return { month: monthString, total: salesInMonth };
  });
  return (
    <div className='flex flex-col gap-5 w-full'>
      <h1 className='text-2xl font-bold text-center mx-6'>Dashboard</h1>
      <div className='container mx-auto py-8'>
        <div className='flex flex-col gap-5 w-full'>
          <section className='grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 gap-x-8 transition-all'>
            <DashBoardCard
              label={"Total Revenue"}
              Icon={DollarSign}
              amount={`$${totalAmount}`}
              description='All Time'
            />
            <DashBoardCard
              label={"Total Paid Subscription"}
              Icon={Calendar}
              amount={`+${salesCount}`}
              description='All Time'
            />
            <DashBoardCard
              label={"Total Users"}
              Icon={PersonStanding}
              amount={`+${userCount}`}
              description='All Time'
            />
            <DashBoardCard
              label={"Users This Month"}
              Icon={UserPlus}
              amount={`${userCountMonth}`}
              description='This Month'
            />
          </section>
          <section className='grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all'>
            <DashboardCartContent>
              <section className='flex justify-between gap-2 pb-2'>
                <p>Recent Users</p>
                <UserRoundCheck className='h-4 w-4' />
              </section>
              {UserData.map((data, index) => (
                <UserDataContent
                  key={index}
                  name={data.name}
                  email={data.email}
                  image={data.image}
                  time={data.time}
                />
              ))}
            </DashboardCartContent>
            <DashboardCartContent>
              <section className='flex justify-between gap-2 pb-2'>
                <p>Recent Sales</p>
                <CreditCard className='h-4 w-4' />
              </section>
              {UserPurchase.map((data, index) => (
                <UserPurchaseContent
                  key={index}
                  name={data.name}
                  email={data.email}
                  image={data.image}
                  purchaseAmount={data.purchaseAmount}
                />
              ))}
            </DashboardCartContent>
          </section>
          <section className='grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all'>
            <BarChart data={monthlyUsersData} />
            <LineGraph data={monthlySalesData} />
          </section>

          <GoalDataContent goal={goalAmount} value={goalProgress} />
        </div>
      </div>
    </div>
  );
}
