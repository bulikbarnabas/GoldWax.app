import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="hu">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content="GoldWax Szépségszalon - Prémium szépségápolási szolgáltatások" />
        <meta name="keywords" content="szépségszalon, kozmetika, fodrászat, goldwax" />
        <meta name="author" content="GoldWax" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="GoldWax Szépségszalon" />
        <meta property="og:description" content="Prémium szépségápolási szolgáltatások" />
        <meta property="og:type" content="website" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#D4AF37" />
        
        {/* Prevent zooming on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Enhanced web compatibility styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
          #root {
            display: flex;
            flex: 1;
            height: 100vh;
            width: 100vw;
            position: relative;
          }
          /* Enhanced button and link styles */
          button, a, [role="button"] {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            cursor: pointer;
          }
          /* Better input handling */
          input, textarea, select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border-radius: 0;
          }
          input:focus, textarea:focus, select:focus {
            outline: none;
          }
          /* Prevent iOS zoom on input focus */
          @media screen and (-webkit-min-device-pixel-ratio: 0) {
            input, textarea, select {
              font-size: 16px !important;
            }
          }
          /* Chrome, Safari, Edge scrollbar */
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
          /* Firefox scrollbar */
          * {
            scrollbar-width: none;
          }
          /* Prevent context menu on long press */
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          /* Allow text selection in inputs and text areas */
          input, textarea, [contenteditable] {
            -webkit-user-select: text;
            -khtml-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}