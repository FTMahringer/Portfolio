'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { frontmatter, content } = testimonial;

  return (
    <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)] hover:shadow-lg transition-shadow">
      <Quote className="w-8 h-8 text-[var(--accent)] mb-4 opacity-50" />
      
      <div className="text-[var(--foreground)] leading-relaxed mb-6">
        &ldquo;{content.trim()}&rdquo;
      </div>

      <div className="flex items-center gap-4">
        {frontmatter.avatar && (
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={frontmatter.avatar}
              alt={frontmatter.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-[var(--foreground)]">
            {frontmatter.linkedin ? (
              <a
                href={frontmatter.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors"
              >
                {frontmatter.name}
              </a>
            ) : (
              frontmatter.name
            )}
          </div>
          <div className="text-sm text-[var(--muted)]">
            {frontmatter.role} at {frontmatter.company}
          </div>
        </div>
      </div>
    </div>
  );
}
