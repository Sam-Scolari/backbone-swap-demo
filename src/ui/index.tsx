/**
 * Add your UI initialization code into this file.
 * i.e. const UI = require("./my-react-app.js")
 */

import React from "react";
import ReactDOM from "react-dom/client";
// @ts-ignore
import styles from "./index.css";
import App from "./App";

// install styles to the document
if (typeof window === "object") {
  const css = document.createElement("style");
  css.setAttribute("id", "app-style");
  css.innerText = styles;
  document.body.appendChild(css);
}

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

export default async () => {
  /**
   * Backbone Bootloader creates #UI div, so you can do something like
   * ReactDOM.createRoot(document.getElementById('UI')).render(UI)
   *
   * This function will be automatically executed when app is loaded in Bootloader.
   */

  const { chains, provider } = configureChains(
    [chain.goerli, chain.kovan],
    [publicProvider()]
  );

  const { connectors } = getDefaultWallets({
    appName: "Backbone Swap Demo",
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const root = ReactDOM.createRoot(document.getElementById("UI"));
  root.render(
    <React.StrictMode>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
    </React.StrictMode>
  );
};
