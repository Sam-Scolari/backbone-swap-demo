import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useEffect } from "react";
import { useState } from "react";
import { chainId, useAccount, useBalance, useNetwork } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
  NativeCurrency,
} from "@uniswap/sdk-core";
import { ethers, BigNumber } from "ethers";

// @ts-ignore
import logo from "./assets/logo.svg";
// @ts-ignore
import cog from "./assets/cog.svg";
// @ts-ignore
import spinner from "./assets/spinner.svg";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { useProvider } from "wagmi";
import JSBI from "jsbi";

export default function App() {
  const [slippage, setSlippage] = useState(5);

  const [fromToken, setFromToken] = useState("WETH");
  const [fromAmount, setFromAmount] = useState<number | undefined>(undefined);
  const [toToken, setToToken] = useState("UNI");
  const [toAmount, setToAmount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [ratio, setRatio] = useState<number | null>(null);
  const { address }: any = useAccount();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const ethBalance = useBalance({
    addressOrName: address,
  });

  const uniBalance = useBalance({
    addressOrName: address,
    token: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  });

  const wethBalance = useBalance({
    addressOrName: address,
    token: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  });

  const { chain }: any = useNetwork();
  const provider = useProvider();

  const DECIMALS = 18;

  const TOKENS = {
    WETH: new Token(
      chain.id,
      "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      DECIMALS,
      "WETH",
      "Wrapped Ether"
    ),
    UNI: new Token(
      chain.id,
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      DECIMALS,
      "UNI",
      "Uniswap"
    ),
  };

  async function getExactInputQuote() {
    if (fromAmount) {
      const router = new AlphaRouter({
        chainId: chain.id,
        provider: provider,
      });

      let wei = ethers.utils.parseUnits(fromAmount.toString(), DECIMALS);

      const route: any = await router.route(
        CurrencyAmount.fromRawAmount(
          fromToken === "ETH" ? TOKENS["WETH"] : TOKENS[fromToken],
          JSBI.BigInt(wei)
        ),
        toToken === "ETH" ? TOKENS["WETH"] : TOKENS[toToken],
        TradeType.EXACT_INPUT,
        {
          recipient: address,
          slippageTolerance: new Percent(slippage, 100),
          deadline: 600,
        }
      );

      const quoteAmountOut: number = route.quote.toFixed(6);
      setRatio(parseFloat((fromAmount / quoteAmountOut).toFixed(3)));
      setToAmount(quoteAmountOut);
    }
  }

  async function getExactOutputQuote() {
    if (toAmount) {
      const router = new AlphaRouter({
        chainId: chain.id,
        provider: provider,
      });

      let wei = ethers.utils.parseUnits(toAmount.toString(), DECIMALS);

      const route: any = await router.route(
        CurrencyAmount.fromRawAmount(
          toToken === "ETH" ? TOKENS["WETH"] : TOKENS[toToken],
          JSBI.BigInt(wei)
        ),
        fromToken === "ETH" ? TOKENS["WETH"] : TOKENS[fromToken],
        TradeType.EXACT_OUTPUT,
        {
          recipient: address,
          slippageTolerance: new Percent(slippage, 100),
          deadline: 600,
        }
      );

      const quoteAmountIn: number = route.quote.toFixed(6);
      setRatio(parseFloat((quoteAmountIn / toAmount).toFixed(3)));
      setFromAmount(quoteAmountIn);
    }
  }

  function getButtonText() {
    if (address) {
      if (ratio) {
        if (fromToken === "ETH") {
          return "Wrap";
        }
        return "Swap";
      }
      return "Set Amount";
    }
    return "Connect Wallet";
  }

  return (
    <div className="w-full h-screen p-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} />
          <h1 className="text-3xl font-bold ml-4 bg-gradient-to-r from-[#C144F6] to-[#5149DA] bg-clip-text text-transparent">
            Backbone Swap Demo
          </h1>
        </div>
        <ConnectButton />
      </header>
      <main className="w-full h-[calc(100%-80px)] flex items-center justify-center">
        <div className="w-[500px] bg-white rounded-2xl drop-shadow-lg p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-[#7E7E7E] text-lg">Swap</span>
            <div className="relative">
              <img
                src={cog}
                className="w-[24px] cursor-pointer"
                onClick={() => setShowConfigModal(!showConfigModal)}
              />
              {showConfigModal && (
                <div className="absolute top-8 right-0 p-2 rounded-md flex flex-col gap-2 bg-white drop-shadow-md border-solid border-[1px]">
                  <span className="font-medium text-[#7E7E7E]">
                    Slippage: {slippage}%
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    className="accent-[#5149DA]"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#EDF1F4] p-4  w-full h-[90px] rounded-lg flex justify-center items-center">
            <input
              placeholder="0"
              min="0.0"
              step="0.01"
              value={fromAmount}
              onKeyUp={() => getExactInputQuote()}
              onChange={(e) => setFromAmount(parseFloat(e.target.value))}
              type="number"
              className="h-full w-full mr-4 bg-transparent outline-none  text-3xl text-[#7E7E7E]"
            />
            <div>
              <select
                value={fromToken}
                onChange={(e) => {
                  setFromAmount(0);
                  setFromToken(e.target.value);
                }}
                className="outline-none flex flex-col text-3xl font-medium text-right bg-transparent text-[#7E7E7E]"
              >
                {toToken === "ETH" || <option value="ETH">ETH</option>}
                {toToken === "UNI" || <option value="UNI">UNI</option>}
                {toToken === "WETH" || <option value="WETH">WETH</option>}
              </select>
              <span className="whitespace-nowrap text-[#7E7E7E]">
                {
                  {
                    ETH:
                      "Balance: " +
                      // @ts-ignore
                      parseFloat(ethBalance.data?.formatted).toFixed(2),
                    WETH:
                      "Balance: " +
                      // @ts-ignore
                      parseFloat(wethBalance.data?.formatted).toFixed(2),
                    UNI:
                      "Balance: " +
                      // @ts-ignore
                      parseFloat(uniBalance.data?.formatted).toFixed(2),
                  }[fromToken]
                }
              </span>
            </div>
          </div>
          <div className="bg-[#EDF1F4] p-4 w-full h-[90px] rounded-lg flex justify-center items-center">
            <input
              placeholder="0"
              min="0.0"
              step="0.01"
              value={toAmount}
              onChange={(e) => setToAmount(parseFloat(e.target.value))}
              onKeyUp={() => getExactOutputQuote()}
              type="number"
              className="h-full w-full  mr-4  bg-transparent outline-none text-3xl text-[#7E7E7E]"
            />
            <div className="flex flex-col">
              <select
                value={toToken}
                onChange={(e) => {
                  setToAmount(0);
                  setToToken(e.target.value);
                }}
                className=" outline-none flex flex-col text-3xl font-medium text-right bg-transparent text-[#7E7E7E]"
              >
                {fromToken === "UNI" || <option value="UNI">UNI</option>}
                {fromToken === "WETH" || <option value="WETH">WETH</option>}
                {fromToken === "ETH" || <option value="ETH">ETH</option>}
              </select>
              <span className="whitespace-nowrap text-[#7E7E7E]">
                {
                  {
                    ETH:
                      "Balance: " +
                      // @ts-ignore
                      parseFloat(ethBalance.data?.formatted).toFixed(2),
                    WETH:
                      "Balance: " +
                      // @ts-ignore
                      parseFloat(wethBalance.data?.formatted).toFixed(2),
                    UNI:
                      "Balance: " +
                      // @ts-ignore
                      parseFloat(uniBalance.data?.formatted).toFixed(2),
                  }[toToken]
                }
              </span>
            </div>
          </div>
          {(fromAmount || toAmount) && (
            <div className={`mt-2 flex items-center`}>
              {ratio !== null || (
                <div className="flex items-center">
                  <img src={spinner} className="animate-spin h-5 w-5 mr-3" />
                  <span className="font-medium text-[#7E7E7E]">Loading</span>
                </div>
              )}
              {ratio && (
                <span className="font-medium text-[#7E7E7E]">
                  1 {toToken} = {ratio} {fromToken}
                </span>
              )}
            </div>
          )}
          <ConnectButton.Custom>
            {({ account, openConnectModal, mounted }) => (
              <button
                onClick={() => openConnectModal()}
                className={`w-full h-[65px] mt-2 font-medium rounded-lg ${
                  address && ratio
                    ? "bg-gradient-to-r from-[#C144F6] to-[#5149DA] text-white"
                    : "text-white bg-[#aaaaaa]"
                } ${ratio ? "cursor-pointer" : "cursor-auto"}`}
              >
                {getButtonText()}
              </button>
            )}
          </ConnectButton.Custom>
        </div>
        <small className="text-[#7E7E7E] absolute left-8 bottom-8">
          Backbone Swap utilizes Uniswap V3 and is intended for demo purposes
          only.
        </small>
      </main>
    </div>
  );
}
