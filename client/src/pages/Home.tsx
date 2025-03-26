import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { ProfileImage } from "@/components/ProfileImage";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function Home() {
  const { toast } = useToast();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  
  // Record page visit
  useEffect(() => {
    const recordVisit = async () => {
      try {
        await apiRequest("POST", "/api/analytics/visit", {
          path: "/",
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        console.error("Failed to record visit:", error);
      }
    };
    
    recordVisit();
  }, []);
  
  // Fetch profile data
  const { data: profileData } = useQuery({
    queryKey: ['/api/profile'],
  });
  
  // Set profile image URL when data is loaded
  useEffect(() => {
    if (profileData?.profileImage) {
      setProfileImageUrl(profileData.profileImage);
    }
  }, [profileData]);
  
  // Fetch projects data
  const { data: projectsData } = useQuery({
    queryKey: ['/api/projects'],
  });
  
  // Fetch featured project
  const { data: featuredProject } = useQuery({
    queryKey: ['/api/projects/featured'],
  });
  
  // Contact form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      const response = await apiRequest("POST", "/api/contact", values);
      
      if (response.ok) {
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully. I'll get back to you soon!",
        });
        
        // Reset form
        form.reset();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-white via-white to-gray-100 py-20 px-6">
          <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between">
            <div className="md:w-2/3 animate-[slideUp_0.5s_ease-out]">
              <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
                Full Stack Developer
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                Hi, I'm <span className="text-accent">{profileData?.name || "Aggelos Kwnstantinou"}</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Young developer passionate about creating impactful digital experiences. Building the web, one line of code at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#projects" className="btn-primary">
                  View My Work
                </a>
                <a href="#contact" className="btn-secondary">
                  Get In Touch
                </a>
              </div>
            </div>
            
            <div className="mb-8 md:mb-0 relative">
              <div className="w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <ProfileImage 
                  imageUrl={profileImageUrl} 
                  onImageUpdate={setProfileImageUrl} 
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-accent text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                17 y/o
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
                About Me
              </span>
              <h2 className="text-4xl font-bold text-gray-900">Who I Am</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Personal Info Card */}
              <div className="card hover:border-accent/20">
                <div className="w-14 h-14 bg-accent-100 text-accent rounded-xl flex items-center justify-center mb-5">
                  <i className="ri-user-line text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Personal Info</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="font-medium w-24 text-gray-700">Name:</span>
                    <span>{profileData?.name || "Aggelos Kwnstantinou"}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium w-24 text-gray-700">Age:</span>
                    <span>{profileData?.age || 17}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium w-24 text-gray-700">Location:</span>
                    <span>{profileData?.location || "Greece"}</span>
                  </li>
                </ul>
              </div>
              
              {/* Skills Card */}
              <div className="card hover:border-accent/20">
                <div className="w-14 h-14 bg-accent-100 text-accent rounded-xl flex items-center justify-center mb-5">
                  <i className="ri-code-line text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Skills</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Web Development</span>
                      <span className="font-medium text-accent">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-accent h-2.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">Backend</span>
                      <span className="font-medium text-accent">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-accent h-2.5 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">UI/UX Design</span>
                      <span className="font-medium text-accent">70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-accent h-2.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Education Card */}
              <div className="card hover:border-accent/20">
                <div className="w-14 h-14 bg-accent-100 text-accent rounded-xl flex items-center justify-center mb-5">
                  <i className="ri-book-open-line text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Education</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-accent text-sm font-semibold">2023 - Present</p>
                    <h4 className="font-bold text-gray-800 mt-1">High School Diploma</h4>
                    <p className="text-sm text-gray-600 mt-1">Currently attending high school</p>
                  </div>
                  <div>
                    <p className="text-accent text-sm font-semibold">2022 - 2023</p>
                    <h4 className="font-bold text-gray-800 mt-1">Web Development Course</h4>
                    <p className="text-sm text-gray-600 mt-1">Online certification</p>
                  </div>
                  <div>
                    <p className="text-accent text-sm font-semibold">2021 - 2022</p>
                    <h4 className="font-bold text-gray-800 mt-1">Introduction to Programming</h4>
                    <p className="text-sm text-gray-600 mt-1">Self-taught</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio Section */}
            <div className="mt-16 card border-2 border-accent/20">
              <h3 className="text-2xl font-bold mb-5 text-gray-900">My Story</h3>
              <p className="text-gray-700 leading-relaxed mb-5 text-lg">
                {profileData?.bio || "I'm a 17-year-old developer passionate about creating innovative digital experiences. Despite my young age, I've already started building various projects, including web applications and an online casino platform."}
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                I'm constantly learning new technologies and improving my skills. My goal is to become a full-stack developer 
                and create applications that make a positive impact on users' lives.
              </p>
            </div>
          </div>
        </section>
        
        {/* Projects Section */}
        <section id="projects" className="py-16 px-6 bg-primary-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Projects</h2>
            
            {/* Featured Project */}
            {featuredProject && (
              <div className="bg-white rounded-xl overflow-hidden shadow-soft mb-12">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img 
                      src={featuredProject.imageUrl || "https://images.unsplash.com/photo-1596865249308-2472dc5216e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500&q=80"} 
                      alt={featuredProject.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 md:w-1/2">
                    <div className="flex items-center mb-4">
                      <span className="bg-accent-100 text-accent-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Featured Project
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
                        Online Casino
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{featuredProject.title}</h3>
                    <p className="text-primary-700 mb-4">
                      {featuredProject.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredProject.tags?.map((tag, index) => (
                        <span key={index} className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      {featuredProject.projectUrl && (
                        <a href={featuredProject.projectUrl} className="text-accent hover:text-accent/90 font-medium flex items-center" target="_blank" rel="noopener noreferrer">
                          <span>View Live</span>
                          <i className="ri-external-link-line ml-1"></i>
                        </a>
                      )}
                      {featuredProject.githubUrl && (
                        <a href={featuredProject.githubUrl} className="text-accent hover:text-accent/90 font-medium flex items-center" target="_blank" rel="noopener noreferrer">
                          <span>Source Code</span>
                          <i className="ri-github-line ml-1"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Project Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData?.filter(p => !p.featured).map((project) => (
                <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-hover transition-shadow">
                  <img 
                    src={project.imageUrl || `https://via.placeholder.com/400x200?text=${encodeURIComponent(project.title)}`} 
                    alt={project.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-primary-700 mb-4 text-sm">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.map((tag, index) => (
                        <span key={index} className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {project.projectUrl && (
                      <a href={project.projectUrl} className="text-accent hover:text-accent/90 text-sm font-medium" target="_blank" rel="noopener noreferrer">
                        View Project →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Analytics Section */}
        <AnalyticsCharts />
        
        {/* Contact Section */}
        <section id="contact" className="py-16 px-6 bg-gradient-to-r from-[#303f9f] to-[#1a237e] text-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Get In Touch</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                    <p className="text-gray-300 mb-6">
                      Feel free to reach out to me through any of these channels.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-mail-line text-accent"></i>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Email</h4>
                      <a href="mailto:aggelos.k@example.com" className="text-gray-300 hover:text-accent transition-colors">
                        aggelos.k@example.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-map-pin-line text-accent"></i>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Location</h4>
                      <p className="text-gray-300">
                        {profileData?.location || "Athens, Greece"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-links-line text-accent"></i>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Social Media</h4>
                      <div className="flex space-x-4 mt-2">
                        <a href="https://github.com" className="text-gray-300 hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                          <i className="ri-github-fill text-2xl"></i>
                        </a>
                        <a href="https://linkedin.com" className="text-gray-300 hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                          <i className="ri-linkedin-fill text-2xl"></i>
                        </a>
                        <a href="https://twitter.com" className="text-gray-300 hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                          <i className="ri-twitter-fill text-2xl"></i>
                        </a>
                        <a href="https://instagram.com" className="text-gray-300 hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                          <i className="ri-instagram-fill text-2xl"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-white">Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Your name" 
                                className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-white">Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Your email" 
                                className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white">Subject</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Subject" 
                              className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white">Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Your message" 
                              rows={5}
                              className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <span className="flex items-center">
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Sending...
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <MobileNavigation />
      
      <footer className="bg-primary-900 text-primary-400 py-8 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} {profileData?.name || "Aggelos Kwnstantinou"}. All rights reserved.</p>
      </footer>
    </div>
  );
}
