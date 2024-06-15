import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
    label: string;
    Icon: LucideIcon;
    amount: any;
    description: string;
}

export const DashBoardCard = ({
    label,
    Icon,
    amount,
    description
}: DashboardCardProps) => {
    return (
        <div className="bg-slate-100/40 shadow flex w-full flex-col gap-3 rounded-[6px] p-5">
            <section className="flex flex-between gap-2">
                <p className="text-sm">{label}</p>
                <Icon className="h-4 w-4" />
            </section>
            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-2xl">{amount}</h2>
                <p className="text-sm">{description}</p>
            </section>
        </div>
    )
}

export function DashboardCartContent(props: React.HtmlHTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={cn(
                "flex w-full flex-col gap-3 rounded-[6px] p-5 shadow bg-slate-100/40",
                props.className
            )}
        />
    )
}