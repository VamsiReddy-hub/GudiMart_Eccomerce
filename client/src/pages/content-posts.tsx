import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ContentPost, Event, SocialPlatform } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { format } from "date-fns";
import { 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui";
import { 
  Calendar,
  CalendarIcon,
  Clock,
  Edit,
  Filter,
  Plus,
  RefreshCcw,
  Send,
  Settings,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentPosts() {
  const { eventId } = useParams();
  const parsedEventId = parseInt(eventId || '0');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
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
  
  // Fetch social platforms
  const { data: platforms } = useQuery({
    queryKey: ['/api/social-platforms'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social-platforms');
      return await response.json() as SocialPlatform[];
    }
  });
  
  // Fetch content posts with filters
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/content-posts', parsedEventId, filter],
    queryFn: async () => {
      if (!parsedEventId) return [];
      let url = `/api/content-posts?eventId=${parsedEventId}`;
      
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      const response = await apiRequest('GET', url);
      return await response.json() as ContentPost[];
    },
    enabled: !!parsedEventId
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('DELETE', `/api/content-posts/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-posts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  });
  
  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('PUT', `/api/content-posts/${postId}`, {
        status: 'published',
        publishedAt: new Date()
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post published successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-posts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive",
      });
    }
  });
  
  // Format date helper
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not scheduled';
    return format(new Date(date), 'MMM dd, yyyy h:mm a');
  };
  
  // Get platform names
  const getPlatformNames = (platformIds: number[] | null) => {
    if (!platformIds || !platforms) return [];
    return platformIds.map(id => {
      const platform = platforms.find(p => p.id === id);
      return platform ? platform.name : '';
    }).filter(Boolean);
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'scheduled':
        return 'bg-warning text-warning-foreground';
      case 'published':
        return 'bg-success text-success-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Handle delete post
  const handleDeletePost = (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };
  
  // Handle publish post
  const handlePublishPost = (postId: number) => {
    if (confirm('Are you sure you want to publish this post now?')) {
      publishPostMutation.mutate(postId);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{event?.name || 'Event'} Content</h1>
          <p className="text-muted-foreground">{event?.description || ''}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Post
          </Button>
          <Link href={`/events/${eventId}/calendar`}>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> Calendar View
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="shadow hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <Badge className={getStatusColor(post.status || 'draft')}>
                    {post.status || 'draft'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {post.content}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1.5">
                  {post.scheduledFor && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>Scheduled: {formatDate(post.scheduledFor)}</span>
                    </div>
                  )}
                  
                  {post.publishedAt && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Published: {formatDate(post.publishedAt)}</span>
                    </div>
                  )}
                  
                  {post.platforms && post.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getPlatformNames(post.platforms as number[]).map((name, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  
                  {post.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublishPost(post.id)}
                    >
                      <Send className="mr-1 h-3 w-3" /> Publish
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No content found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first post to start managing your social media content
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Create a Post</Button>
        </div>
      )}
      
      {/* Create Post Modal will be added later */}
    </div>
  );
}