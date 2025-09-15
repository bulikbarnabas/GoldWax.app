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

        {/* Add custom styles for web */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          #root {
            display: flex;
            flex: 1;
            height: 100vh;
          }
          /* Prevent text selection on buttons */
          button, a {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          /* Fix for web input focus */
          input:focus, textarea:focus {
            outline: none;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}