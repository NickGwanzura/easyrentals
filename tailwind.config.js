/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* IBM Carbon Design System - Font Family */
      fontFamily: {
        sans: ['var(--cds-font-family)', 'IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--cds-font-family-mono)', 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'monospace'],
        'carbon': ['IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'carbon-mono': ['IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'monospace'],
      },
      
      /* IBM Carbon Design System - Colors */
      colors: {
        // Carbon Core Colors
        carbon: {
          // Primary Blue
          'blue-10': '#edf5ff',
          'blue-20': '#d0e2ff',
          'blue-30': '#a6c8ff',
          'blue-40': '#78a9ff',
          'blue-50': '#4589ff',
          'blue-60': '#0f62fe',
          'blue-70': '#0043ce',
          'blue-80': '#002d9c',
          'blue-90': '#001d6c',
          'blue-100': '#001141',
          
          // Grays
          'gray-10': '#f4f4f4',
          'gray-20': '#e0e0e0',
          'gray-30': '#c6c6c6',
          'gray-40': '#a8a8a8',
          'gray-50': '#8d8d8d',
          'gray-60': '#6f6f6f',
          'gray-70': '#525252',
          'gray-80': '#393939',
          'gray-90': '#262626',
          'gray-100': '#161616',
          
          // Reds
          'red-10': '#fff1f1',
          'red-20': '#ffd7d9',
          'red-30': '#ffb3b8',
          'red-40': '#ff8389',
          'red-50': '#fa4d56',
          'red-60': '#da1e28',
          'red-70': '#ba1b23',
          'red-80': '#750e13',
          'red-90': '#520408',
          'red-100': '#2d0709',
          
          // Greens
          'green-10': '#defbe6',
          'green-20': '#a7f0ba',
          'green-30': '#6fdc8c',
          'green-40': '#42be65',
          'green-50': '#24a148',
          'green-60': '#198038',
          'green-70': '#0e6027',
          'green-80': '#044317',
          'green-90': '#022d0d',
          'green-100': '#071908',
          
          // Yellows
          'yellow-10': '#fcf4d6',
          'yellow-20': '#fddc69',
          'yellow-30': '#f1c21b',
          'yellow-40': '#d2a106',
          'yellow-50': '#b28600',
          'yellow-60': '#8e6a00',
          'yellow-70': '#684e00',
          'yellow-80': '#483700',
          'yellow-90': '#302400',
          'yellow-100': '#1c1500',
          
          // Oranges
          'orange-10': '#fff2e8',
          'orange-20': '#ffd9be',
          'orange-30': '#ffb784',
          'orange-40': '#ff832b',
          'orange-50': '#eb6208',
          'orange-60': '#ba4e00',
          'orange-70': '#8a3800',
          'orange-80': '#5e2900',
          'orange-90': '#3e1a00',
          'orange-100': '#231000',
          
          // Teals
          'teal-10': '#d9fbfb',
          'teal-20': '#9ef0f0',
          'teal-30': '#3ddbd9',
          'teal-40': '#08bdba',
          'teal-50': '#009d9a',
          'teal-60': '#007d79',
          'teal-70': '#005d5d',
          'teal-80': '#004144',
          'teal-90': '#022b30',
          'teal-100': '#081a1c',
          
          // Purples
          'purple-10': '#f6f2ff',
          'purple-20': '#e8daff',
          'purple-30': '#d4bbff',
          'purple-40': '#be95ff',
          'purple-50': '#a56eff',
          'purple-60': '#8a3ffc',
          'purple-70': '#6929c4',
          'purple-80': '#491d8b',
          'purple-90': '#31135e',
          'purple-100': '#1c0f30',
          
          // Magentas
          'magenta-10': '#fff0f7',
          'magenta-20': '#ffd6e8',
          'magenta-30': '#ffafd2',
          'magenta-40': '#ff7eb6',
          'magenta-50': '#ee5396',
          'magenta-60': '#d02670',
          'magenta-70': '#9f1853',
          'magenta-80': '#740937',
          'magenta-90': '#510224',
          'magenta-100': '#2a0a18',
          
          // Cyan
          'cyan-10': '#e5f6ff',
          'cyan-20': '#bae6ff',
          'cyan-30': '#82cfff',
          'cyan-40': '#33b1ff',
          'cyan-50': '#1192e8',
          'cyan-60': '#0072c3',
          'cyan-70': '#00539a',
          'cyan-80': '#003a6d',
          'cyan-90': '#012749',
          'cyan-100': '#061727',
          
          // Cool Gray
          'cool-gray-10': '#f2f4f8',
          'cool-gray-20': '#dde1e6',
          'cool-gray-30': '#c1c7cd',
          'cool-gray-40': '#a2a9b0',
          'cool-gray-50': '#878d96',
          'cool-gray-60': '#697077',
          'cool-gray-70': '#4d5358',
          'cool-gray-80': '#343a3f',
          'cool-gray-90': '#21272a',
          'cool-gray-100': '#121619',
          
          // Warm Gray
          'warm-gray-10': '#f7f3f2',
          'warm-gray-20': '#e5e0df',
          'warm-gray-30': '#cac5c4',
          'warm-gray-40': '#ada8a8',
          'warm-gray-50': '#8f8b8b',
          'warm-gray-60': '#736f6f',
          'warm-gray-70': '#565151',
          'warm-gray-80': '#3c3838',
          'warm-gray-90': '#272525',
          'warm-gray-100': '#171414',
        },
        
        // Carbon Semantic Colors (mapped to CSS variables)
        'cds': {
          'background': 'var(--cds-background)',
          'background-hover': 'var(--cds-background-hover)',
          'background-active': 'var(--cds-background-active)',
          'background-selected': 'var(--cds-background-selected)',
          'background-selected-hover': 'var(--cds-background-selected-hover)',
          
          'layer-01': 'var(--cds-layer-01)',
          'layer-02': 'var(--cds-layer-02)',
          'layer-03': 'var(--cds-layer-03)',
          'layer-hover-01': 'var(--cds-layer-hover-01)',
          'layer-active-01': 'var(--cds-layer-active-01)',
          'layer-selected-01': 'var(--cds-layer-selected-01)',
          'layer-selected-hover-01': 'var(--cds-layer-selected-hover-01)',
          
          'border-subtle': 'var(--cds-border-subtle-01)',
          'border-subtle-00': 'var(--cds-border-subtle-00)',
          'border-strong': 'var(--cds-border-strong-01)',
          'border-interactive': 'var(--cds-border-interactive)',
          'border-inverse': 'var(--cds-border-inverse)',
          'border-disabled': 'var(--cds-border-disabled)',
          
          'text-primary': 'var(--cds-text-primary)',
          'text-secondary': 'var(--cds-text-secondary)',
          'text-placeholder': 'var(--cds-text-placeholder)',
          'text-helper': 'var(--cds-text-helper)',
          'text-error': 'var(--cds-text-error)',
          'text-inverse': 'var(--cds-text-inverse)',
          'text-on-color': 'var(--cds-text-on-color)',
          'text-disabled': 'var(--cds-text-disabled)',
          
          'link-primary': 'var(--cds-link-primary)',
          'link-primary-hover': 'var(--cds-link-primary-hover)',
          
          'icon-primary': 'var(--cds-icon-primary)',
          'icon-secondary': 'var(--cds-icon-secondary)',
          'icon-interactive': 'var(--cds-icon-interactive)',
          'icon-inverse': 'var(--cds-text-inverse)',
          'icon-disabled': 'var(--cds-text-disabled)',
          
          'button-primary': 'var(--cds-button-primary)',
          'button-primary-hover': 'var(--cds-button-primary-hover)',
          'button-secondary': 'var(--cds-button-secondary)',
          'button-secondary-hover': 'var(--cds-button-secondary-hover)',
          'button-tertiary': 'var(--cds-button-tertiary)',
          'button-danger': 'var(--cds-button-danger-primary)',
          'button-danger-hover': 'var(--cds-button-danger-primary-hover)',
          'button-disabled': 'var(--cds-button-disabled)',
          
          'support-error': 'var(--cds-support-error)',
          'support-success': 'var(--cds-support-success)',
          'support-warning': 'var(--cds-support-warning)',
          'support-info': 'var(--cds-support-info)',
          
          'focus': 'var(--cds-focus)',
          'focus-inverse': 'var(--cds-focus-inverse)',
          'highlight': 'var(--cds-highlight)',
          'overlay': 'var(--cds-overlay)',
        },
        
        // Support legacy colors mapping to Carbon
        primary: {
          50: 'var(--brand-primary-50, #edf5ff)',
          100: 'var(--brand-primary-100, #d0e2ff)',
          200: 'var(--brand-primary-200, #a6c8ff)',
          300: 'var(--brand-primary-300, #78a9ff)',
          400: 'var(--brand-primary-400, #4589ff)',
          500: 'var(--brand-primary-500, #0f62fe)',
          600: 'var(--brand-primary, #0f62fe)',
          700: 'var(--brand-primary-700, #0043ce)',
          800: 'var(--brand-primary-800, #002d9c)',
          900: 'var(--brand-primary-900, #001d6c)',
          950: 'var(--brand-primary-950, #001141)',
        },
        brand: {
          primary: 'var(--brand-primary, #0f62fe)',
          'primary-light': 'var(--brand-primary-light, #4589ff)',
          'primary-dark': 'var(--brand-primary-dark, #0043ce)',
          secondary: 'var(--brand-secondary, #393939)',
          accent: 'var(--brand-accent, #f1c21b)',
          background: 'var(--brand-background, #f4f4f4)',
          surface: 'var(--brand-surface, #ffffff)',
          text: 'var(--brand-text, #161616)',
          'text-muted': 'var(--brand-text-muted, #525252)',
        },
        success: {
          50: '#defbe6',
          100: '#a7f0ba',
          200: '#6fdc8c',
          300: '#42be65',
          400: '#24a148',
          500: '#198038',
          600: '#0e6027',
          700: '#044317',
          800: '#022d0d',
          900: '#071908',
        },
        warning: {
          50: '#fcf4d6',
          100: '#fddc69',
          200: '#f1c21b',
          300: '#d2a106',
          400: '#b28600',
          500: '#8e6a00',
          600: '#684e00',
          700: '#483700',
          800: '#302400',
          900: '#1c1500',
        },
        danger: {
          50: '#fff1f1',
          100: '#ffd7d9',
          200: '#ffb3b8',
          300: '#ff8389',
          400: '#fa4d56',
          500: '#da1e28',
          600: '#ba1b23',
          700: '#750e13',
          800: '#520408',
          900: '#2d0709',
        },
      },
      
      /* IBM Carbon Design System - Spacing */
      spacing: {
        '01': 'var(--cds-spacing-01)',
        '02': 'var(--cds-spacing-02)',
        '03': 'var(--cds-spacing-03)',
        '04': 'var(--cds-spacing-04)',
        '05': 'var(--cds-spacing-05)',
        '06': 'var(--cds-spacing-06)',
        '07': 'var(--cds-spacing-07)',
        '08': 'var(--cds-spacing-08)',
        '09': 'var(--cds-spacing-09)',
        '10': 'var(--cds-spacing-10)',
        '11': 'var(--cds-spacing-11)',
        '12': 'var(--cds-spacing-12)',
        '13': 'var(--cds-spacing-13)',
        // Legacy mapping
        'cds-01': '0.125rem',
        'cds-02': '0.25rem',
        'cds-03': '0.5rem',
        'cds-04': '0.75rem',
        'cds-05': '1rem',
        'cds-06': '1.5rem',
        'cds-07': '2rem',
        'cds-08': '2.5rem',
        'cds-09': '3rem',
        'cds-10': '4rem',
        'cds-11': '5rem',
        'cds-12': '6rem',
        'cds-13': '10rem',
      },
      
      /* IBM Carbon Design System - Layout */
      spacing: {
        'layout-01': 'var(--cds-layout-01)',
        'layout-02': 'var(--cds-layout-02)',
        'layout-03': 'var(--cds-layout-03)',
        'layout-04': 'var(--cds-layout-04)',
        'layout-05': 'var(--cds-layout-05)',
        'layout-06': 'var(--cds-layout-06)',
        'layout-07': 'var(--cds-layout-07)',
      },
      
      /* IBM Carbon Design System - Border Radius */
      borderRadius: {
        'cds': '0',
        'cds-sm': '0',
        'cds-md': '0',
        'cds-lg': '0',
        'cds-full': '0',
      },
      
      /* IBM Carbon Design System - Box Shadow */
      boxShadow: {
        'cds-sm': '0 2px 6px rgba(0, 0, 0, 0.2)',
        'cds-md': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'cds-lg': '0 8px 24px rgba(0, 0, 0, 0.3)',
        'cds-xl': '0 12px 32px rgba(0, 0, 0, 0.35)',
        'cds-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      
      /* IBM Carbon Design System - Transitions */
      transitionDuration: {
        'fast-01': 'var(--cds-duration-fast-01)',
        'fast-02': 'var(--cds-duration-fast-02)',
        'moderate-01': 'var(--cds-duration-moderate-01)',
        'moderate-02': 'var(--cds-duration-moderate-02)',
        'slow-01': 'var(--cds-duration-slow-01)',
        'slow-02': 'var(--cds-duration-slow-02)',
      },
      
      transitionTimingFunction: {
        'productive': 'var(--cds-easing-productive)',
        'expressive': 'var(--cds-easing-expressive)',
      },
      
      /* IBM Carbon Design System - Z-Index */
      zIndex: {
        'cds-background': 'var(--cds-z-index-background)',
        'cds-base': 'var(--cds-z-index-base)',
        'cds-dropdown': 'var(--cds-z-index-dropdown)',
        'cds-sticky': 'var(--cds-z-index-sticky)',
        'cds-banner': 'var(--cds-z-index-banner)',
        'cds-overlay': 'var(--cds-z-index-overlay)',
        'cds-modal': 'var(--cds-z-index-modal)',
        'cds-popover': 'var(--cds-z-index-popover)',
        'cds-toast': 'var(--cds-z-index-toast)',
        'cds-tooltip': 'var(--cds-z-index-tooltip)',
      },
      
      /* IBM Carbon Design System - Typography */
      fontSize: {
        'heading-compact-01': ['0.875rem', { lineHeight: '1.28572', letterSpacing: '0.16px', fontWeight: '600' }],
        'heading-compact-02': ['1rem', { lineHeight: '1.375', letterSpacing: '0', fontWeight: '600' }],
        'heading-01': ['0.875rem', { lineHeight: '1.42857', letterSpacing: '0.16px', fontWeight: '600' }],
        'heading-02': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
        'heading-03': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
        'heading-04': ['1.75rem', { lineHeight: '1.28572', letterSpacing: '0', fontWeight: '400' }],
        'heading-05': ['2rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '400' }],
        'heading-06': ['2.625rem', { lineHeight: '1.199', letterSpacing: '0', fontWeight: '300' }],
        'heading-07': ['3.5rem', { lineHeight: '1.19', letterSpacing: '0', fontWeight: '300' }],
        'body-compact-01': ['0.875rem', { lineHeight: '1.28572', letterSpacing: '0.16px' }],
        'body-compact-02': ['1rem', { lineHeight: '1.375', letterSpacing: '0' }],
        'body-01': ['0.875rem', { lineHeight: '1.42857', letterSpacing: '0.16px' }],
        'body-02': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'legal-01': ['0.75rem', { lineHeight: '1.33333', letterSpacing: '0.32px' }],
        'legal-02': ['0.875rem', { lineHeight: '1.28572', letterSpacing: '0.16px' }],
      },
      
      fontWeight: {
        'carbon-light': '300',
        'carbon-regular': '400',
        'carbon-semibold': '600',
      },
      
      lineHeight: {
        'cds-01': '1.33333',
        'cds-02': '1.28572',
        'cds-03': '1.375',
        'cds-04': '1.4',
        'cds-05': '1.42857',
        'cds-06': '1.5',
      },
      
      /* IBM Carbon Design System - Animation */
      keyframes: {
        'cds-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'cds-fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'cds-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'cds-slide-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-0.5rem)' },
        },
        'cds-skeleton': {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'cds-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      
      animation: {
        'cds-fade-in': 'cds-fade-in var(--cds-duration-moderate-01) var(--cds-easing-productive)',
        'cds-fade-out': 'cds-fade-out var(--cds-duration-fast-01) var(--cds-easing-productive)',
        'cds-slide-in': 'cds-slide-in var(--cds-duration-moderate-01) var(--cds-easing-productive)',
        'cds-slide-out': 'cds-slide-out var(--cds-duration-fast-01) var(--cds-easing-productive)',
        'cds-skeleton': 'cds-skeleton 1000ms infinite',
        'cds-rotate': 'cds-rotate 500ms linear infinite',
      },
    },
  },
  plugins: [],
}
