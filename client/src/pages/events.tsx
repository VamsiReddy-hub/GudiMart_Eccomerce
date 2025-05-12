import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CreditCard, 
  Plus, 
  Users 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface EventsProps {
  userId?: number;
}

export default function Events({ userId }: EventsProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch events for the user
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events', userId],
    queryFn: async () => {
      const queryParams = userId ? `?userId=${userId}` : '';
      const response = await apiRequest('GET', `/api/events${queryParams}`);
      return await response.json() as Event[];
    }
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const handleCreateEvent = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Events</h1>
        <Button onClick={handleCreateEvent} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="shadow hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>
                  {event.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2">
                  <Link href={`/events/${event.id}/content`}>
                    <Button variant="outline" size="sm">
                      Manage Content
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}/team`}>
                    <Button variant="outline" size="sm">
                      <Users className="mr-1 h-3 w-3" /> Team
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground mb-6">Create your first event to start managing your social media content</p>
          <Button onClick={handleCreateEvent}>Create an Event</Button>
        </div>
      )}

      {/* Event creation modal will be added later */}
    </div>
  );
}