/// <reference types="vite/client" />

import React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      marquee: any;
    }
  }
}
