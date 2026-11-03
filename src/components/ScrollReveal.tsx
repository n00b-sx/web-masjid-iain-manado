'use client';

import React from 'react';
import { motion } from 'motion/react';

export const FLUID_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type MotionTag = 'div' | 'section' | 'article' | 'figure' | 'li';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  y?: number;
  duration?: number;
  as?: MotionTag;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  yOffset,
  y,
  duration = 0.65,
  as = 'div',
}: ScrollRevealProps) {
  const offset = y ?? yOffset ?? 28;
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -40px 0px' }}
      transition={{ duration, delay, ease: FLUID_EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface ScrollStaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function ScrollStaggerGroup({
  children,
  className,
  staggerDelay = 0.08,
}: ScrollStaggerGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -30px 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScrollStaggerItemProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  as?: MotionTag;
}

export function ScrollStaggerItem({
  children,
  className,
  hoverLift = false,
  as = 'div',
}: ScrollStaggerItemProps) {
  const Component = motion[as];

  return (
    <Component
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: FLUID_EASE },
        },
      }}
      whileHover={
        hoverLift
          ? {
              y: -4,
              transition: { duration: 0.22, ease: 'easeOut' },
            }
          : undefined
      }
      className={className}
    >
      {children}
    </Component>
  );
}

interface AnimatedProgressBarProps {
  percent: number;
  className?: string;
  ariaLabel?: string;
}

export function AnimatedProgressBar({
  percent,
  className,
  ariaLabel,
}: AnimatedProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <motion.div
      initial={{ width: '0%' }}
      whileInView={{ width: `${clamped}%` }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.95, ease: FLUID_EASE, delay: 0.1 }}
      className={className}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
