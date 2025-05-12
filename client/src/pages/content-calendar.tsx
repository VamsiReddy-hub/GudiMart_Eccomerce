import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { CalendarEntry, ContentPost, Event } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentCalendar() {
  const { eventId } = useParams();
  const parsedEventId = parseInt(eventId || '0');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch event details
  const { data: event } = useQuery({
    queryKey: ['/api/events', parsedEventId],
    queryFn: async () => {
      if (!parsedEventId) return null;
      const response = await apiRequest('GET', `/api/events/${parsedEventId}`);
      return await response.json() as Event;
    },
    enabled: !!parsedEventId
  });
  
  // Fetch calendar entries
  const { data: calendarEntries, isLoading } = useQuery({
    queryKey: ['/api/calendar', parsedEventId, format(currentMonth, 'MM-yyyy')],
    queryFn: async () => {
      if (!parsedEventId) return [];
      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();
      const response = await apiRequest('GET', `/api/events/${parsedEventId}/calendar?month=${month}&year=${year}`);
      return await response.json() as CalendarEntry[];
    },
    enabled: !!parsedEventId
  });
  
  // Calculate calendar days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const daysList = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Handle month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Get entries for a specific date
  const getEntriesForDay = (date: Date) => {
    if (!calendarEntries) return [];
    return calendarEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Determine the color for each entry type
  const getEntryColor = (type: string) => {
    switch(type) {
      case 'post':
        return 'bg-primary text-primary-foreground';
      case 'milestone':
        return 'bg-secondary text-secondary-foreground';
      case 'reminder':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{event?.name || 'Event'} Calendar</h1>
          <p className="text-muted-foreground">{event?.description || ''}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
          <Link href={`/events/${eventId}/content`}>
            <Button variant="outline">View Content</Button>
          </Link>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex space-x-1">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* First row empty cells */}
            {Array.from({ length: getDay(monthStart) }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-24 border rounded-md bg-muted/10"></div>
            ))}
            
            {/* Calendar days */}
            {daysList.map((day) => {
              const entries = getEntriesForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={day.toString()} 
                  className={`h-24 border rounded-md p-1 overflow-hidden transition-colors ${
                    isToday ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="text-right mb-1">
                    <span className={`text-xs px-1 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {entries.slice(0, 3).map((entry) => (
                      <div 
                        key={entry.id}
                        className={`text-xs p-1 rounded truncate ${getEntryColor(entry.type)}`}
                      >
                        {entry.title}
                      </div>
                    ))}
                    
                    {entries.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{entries.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Last row empty cells */}
            {Array.from({ length: 6 - getDay(monthEnd) }).map((_, index) => (
              <div key={`empty-end-${index}`} className="h-24 border rounded-md bg-muted/10"></div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Calendar Entry Modal will be added later */}
    </div>
  );
}