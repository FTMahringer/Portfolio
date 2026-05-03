import { getAllProjects } from '@/lib/mdx';
import { getAllBlogPosts } from '@/lib/mdx';

export function getPortfolioStats() {
  const projects = getAllProjects();
  const blogPosts = getAllBlogPosts();
  
  // Calculate years of experience (you can adjust the start date)
  const careerStartYear = 2020; // Adjust to your actual start year
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = currentYear - careerStartYear;

  return {
    totalProjects: projects.length,
    totalBlogPosts: blogPosts.length,
    yearsOfExperience,
  };
}
