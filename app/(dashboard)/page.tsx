import { CalendarView } from "@/components/calendar/calendar-view"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CalendarView />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </main>
  )
}
