import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, MessageCircle, Star, Send } from "lucide-react";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const profileSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  locationId: z.string().min(1, "Location ID is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  categories: z.array(z.string()).optional(),
  isVerified: z.boolean().default(false),
  isConnected: z.boolean().default(true),
});

const postSchema = z.object({
  profileId: z.string().min(1, "Profile is required"),
  postType: z.enum(["update", "offer", "event", "product"]).default("update"),
  content: z.string().min(1, "Content is required"),
  ctaType: z.enum(["book", "order", "learn_more", "call", "none"]).optional(),
  ctaUrl: z.string().optional(),
  eventTitle: z.string().optional(),
  eventStartDate: z.string().optional(),
  eventEndDate: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PostFormData = z.infer<typeof postSchema>;

export default function GoogleMyBusiness() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("profiles");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<any[]>({
    queryKey: ["/api/gmb/profiles"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/gmb/posts"],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/gmb/reviews"],
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      locationName: "",
      locationId: "",
      address: "",
      phone: "",
      website: "",
      categories: [],
      isVerified: false,
      isConnected: true,
    }
  });

  const postForm = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      profileId: "",
      postType: "update",
      content: "",
      ctaType: "none",
      ctaUrl: "",
      eventTitle: "",
      eventStartDate: "",
      eventEndDate: "",
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest("POST", "/api/gmb/profiles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gmb/profiles"] });
      toast({ title: "Success", description: "GMB profile created" });
      setIsProfileDialogOpen(false);
      profileForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create profile", variant: "destructive" });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) => apiRequest("POST", "/api/gmb/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gmb/posts"] });
      toast({ title: "Success", description: "Post created successfully" });
      setIsPostDialogOpen(false);
      postForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  });

  const publishPostMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/gmb/posts/${id}/publish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gmb/posts"] });
      toast({ title: "Success", description: "Post published to Google" });
    },
  });

  const respondToReviewMutation = useMutation({
    mutationFn: ({ id, responseText }: { id: string; responseText: string }) =>
      apiRequest("PATCH", `/api/gmb/reviews/${id}/respond`, { responseText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gmb/reviews"] });
      toast({ title: "Success", description: "Review response posted" });
    },
  });

  const profilesContent = (
    <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
      <CardHeader>
        <CardTitle className="font-montserrat text-salis-black dark:text-white">Business Profiles</CardTitle>
        <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
          Connected Google My Business locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profilesLoading ? (
          <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading profiles...</p>
        ) : profiles.length === 0 ? (
          <p className="text-salis-gray font-poppins" data-testid="text-no-profiles">No GMB profiles found</p>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile: any) => (
              <Card key={profile.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-profile-${profile.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-5 w-5 text-salis-gray dark:text-salis-gray-light" />
                        <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-location-name-${profile.id}`}>
                          {profile.locationName}
                        </h3>
                        {profile.isVerified && (
                          <Badge className="bg-green-500 text-white" data-testid={`badge-verified-${profile.id}`}>
                            Verified
                          </Badge>
                        )}
                        {profile.isConnected && (
                          <Badge className="bg-salis-black text-white" data-testid={`badge-connected-${profile.id}`}>
                            Connected
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-salis-gray dark:text-salis-gray-light space-y-1">
                        {profile.address && <p data-testid={`text-address-${profile.id}`}>Address: {profile.address}</p>}
                        {profile.phone && <p data-testid={`text-phone-${profile.id}`}>Phone: {profile.phone}</p>}
                        {profile.website && <p data-testid={`text-website-${profile.id}`}>Website: {profile.website}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const postsContent = (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsPostDialogOpen(true)}
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-post"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>
      <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
        <CardHeader>
          <CardTitle className="font-montserrat text-salis-black dark:text-white">GMB Posts</CardTitle>
          <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
            Updates, offers, and events posted to Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <p className="text-salis-gray font-poppins" data-testid="text-loading-posts">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-salis-gray font-poppins" data-testid="text-no-posts">No posts found</p>
          ) : (
            <div className="grid gap-4">
              {posts.map((post: any) => (
                <Card key={post.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-post-${post.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-salis-black text-white" data-testid={`badge-post-type-${post.id}`}>
                            {post.postType}
                          </Badge>
                          <Badge className={post.status === "published" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"} data-testid={`badge-post-status-${post.id}`}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2" data-testid={`text-post-content-${post.id}`}>
                          {post.content}
                        </p>
                        {post.createdAt && (
                          <p className="text-xs text-salis-gray dark:text-salis-gray-light" data-testid={`text-post-date-${post.id}`}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {post.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => publishPostMutation.mutate(post.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          data-testid={`button-publish-${post.id}`}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const reviewsContent = (
    <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
      <CardHeader>
        <CardTitle className="font-montserrat text-salis-black dark:text-white">Customer Reviews</CardTitle>
        <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
          Reviews from Google My Business
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviewsLoading ? (
          <p className="text-salis-gray font-poppins" data-testid="text-loading-reviews">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-salis-gray font-poppins" data-testid="text-no-reviews">No reviews found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review: any) => (
                <TableRow key={review.id} data-testid={`row-review-${review.id}`}>
                  <TableCell className="font-medium" data-testid={`text-reviewer-${review.id}`}>{review.reviewerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.starRating || 0 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" data-testid={`text-comment-${review.id}`}>
                    {review.comment || "No comment"}
                  </TableCell>
                  <TableCell data-testid={`text-review-date-${review.id}`}>
                    {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    {!review.ownerResponse && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const response = prompt("Enter your response:");
                          if (response) {
                            respondToReviewMutation.mutate({ id: review.id, responseText: response });
                          }
                        }}
                        data-testid={`button-respond-${review.id}`}
                      >
                        Respond
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <TabsPageLayout
        title="Google My Business"
        description="Manage GMB profiles, posts, and customer reviews"
        icon={Building}
        primaryAction={{
          label: "Add Profile",
          icon: Building,
          onClick: () => setIsProfileDialogOpen(true),
          testId: "button-add-profile",
        }}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        tabs={[
          {
            id: "profiles",
            label: "Profiles",
            icon: Building,
            content: profilesContent,
          },
          {
            id: "posts",
            label: "Posts",
            icon: MessageCircle,
            content: postsContent,
          },
          {
            id: "reviews",
            label: "Reviews",
            icon: Star,
            content: reviewsContent,
          },
        ]}
      />

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Add GMB Profile</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Connect a Google My Business location
            </DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit((data) => createProfileMutation.mutate(data))} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Downtown Auto Shop" data-testid="input-location-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="accounts/.../locations/..." data-testid="input-location-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St, City, State" data-testid="input-profile-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-profile-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProfileMutation.isPending} data-testid="button-submit-profile">
                  {createProfileMutation.isPending ? "Adding..." : "Add Profile"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create GMB Post</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Create a new post for Google My Business
            </DialogDescription>
          </DialogHeader>
          <Form {...postForm}>
            <form onSubmit={postForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
              <FormField
                control={postForm.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-profile">
                          <SelectValue placeholder="Select profile" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles.map((profile: any) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.locationName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={postForm.control}
                name="postType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-post-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={postForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Post content..." rows={4} data-testid="input-post-content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createPostMutation.isPending} data-testid="button-submit-post">
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
