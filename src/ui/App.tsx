import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useEffect } from "react";
import { useState } from "react";
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractWrite,
  useSigner,
} from "wagmi";
import { CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { BigNumber, ethers, Signer } from "ethers";
// @ts-ignore
import logo from "./assets/logo.svg";
// @ts-ignore
import cog from "./assets/cog.svg";
// @ts-ignore
import spinner from "./assets/spinner.svg";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { useProvider } from "wagmi";
import JSBI from "jsbi";
import {
  V3_SWAP_ROUTER,
  TOKENS,
  DECIMALS,
  CHAIN_ID,
  WETH_ABI,
} from "./constants";
import toast, { Toaster } from "react-hot-toast";

enum State {
  CONNECT_WALLET = "Connect Wallet",
  SET_AMOUNT = "Set Amount",
  INSUFFICIENT_BALANCE = "Insufficient Balance",
  WRAP = "Wrap",
  WRAP_AND_SWAP = "Wrap & Swap",
  SWAP = "Swap",
  UNWRAP = "Unwrap",
  SWAP_AND_UNWRAP = "Swap & Unwrap",
}

export default function App() {
  // Handles the swap process state
  const [state, setState] = useState(State.CONNECT_WALLET);

  // Tokens to be swapped
  const [fromToken, setFromToken] = useState("WETH");
  const [toToken, setToToken] = useState("UNI");

  // Token amounts to be swapped
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");

  // Slippage for swap
  const [slippage, setSlippage] = useState(5);

  // 1 toToken = {ratio} fromToken
  const [ratio, setRatio] = useState<number | undefined>(undefined);

  // Transaction route calculated for non ETH <-> WETH swaps
  const [transaction, setTransaction] = useState<any>(undefined);

  // Show/hide config modal
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Connected wallets address
  const { address }: any = useAccount();

  // Connected wallet provider
  const provider = useProvider();

  // Get ETH balance
  const ethBalance = useBalance({
    addressOrName: address,
  });

  // Get UNI balance
  const uniBalance = useBalance({
    addressOrName: address,
    token: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  });

  // Get WETH balance
  const wethBalance = useBalance({
    addressOrName: address,
    token: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  });

  // Signer
  const { data: signer, isError, isLoading } = useSigner();

  // Gets a quote for an ExactInput Swap
  async function getExactInputQuote() {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      if (fromToken.includes("ETH") && toToken.includes("ETH")) {
        setRatio(1);
        setToAmount(fromAmount);
      } else {
        const router = new AlphaRouter({
          chainId: CHAIN_ID,
          provider: provider,
        });

        const route: any = await router.route(
          CurrencyAmount.fromRawAmount(
            fromToken === "ETH" ? TOKENS["WETH"] : TOKENS[fromToken],
            JSBI.BigInt(ethers.utils.parseUnits(fromAmount, DECIMALS))
          ),
          toToken === "ETH" ? TOKENS["WETH"] : TOKENS[toToken],
          TradeType.EXACT_INPUT,
          {
            recipient: address,
            slippageTolerance: new Percent(slippage, 100),
            deadline: Math.floor(Date.now() / 1000 + 600), // 600 Seconds or 10 Minutes
          }
        );

        const routeTransaction = {
          data: route.methodParameters.calldata,
          to: V3_SWAP_ROUTER,
          value: BigNumber.from(route.methodParameters.value),
          from: address,
          gasPrice: BigNumber.from(route.gasPriceWei),
          gasLimit: ethers.utils.hexlify(1000000),
        };

        const quoteAmountOut = route.quote.toFixed(6);
        const quoteRatio = (parseFloat(fromAmount) / quoteAmountOut).toFixed(3);

        setRatio(parseFloat(quoteRatio));
        setToAmount(quoteAmountOut);
        setTransaction(routeTransaction);
      }
    }
  }

  // Gets a quote for an ExactOutput Swap
  async function getExactOutputQuote() {
    if (toAmount && parseFloat(toAmount) > 0) {
      if (fromToken.includes("ETH") && toToken.includes("ETH")) {
        setRatio(1);
        setFromAmount(toAmount);
      } else {
        const router = new AlphaRouter({
          chainId: CHAIN_ID,
          provider: provider,
        });

        const route: any = await router.route(
          CurrencyAmount.fromRawAmount(
            toToken === "ETH" ? TOKENS["WETH"] : TOKENS[toToken],
            JSBI.BigInt(ethers.utils.parseUnits(toAmount, DECIMALS))
          ),
          fromToken === "ETH" ? TOKENS["WETH"] : TOKENS[fromToken],
          TradeType.EXACT_OUTPUT,
          {
            recipient: address,
            slippageTolerance: new Percent(slippage, 100),
            deadline: Math.floor(Date.now() / 1000 + 600), // 600 Seconds or 10 Minutes
          }
        );

        const routeTransaction = {
          data: route.methodParameters.calldata,
          to: V3_SWAP_ROUTER,
          value: BigNumber.from(route.methodParameters.value),
          from: address,
          gasPrice: BigNumber.from(route.gasPriceWei),
          gasLimit: ethers.utils.hexlify(1000000),
        };

        const quoteAmountIn = route.quote.toFixed(6);
        const quoteRatio = (quoteAmountIn / parseFloat(toAmount)).toFixed(3);

        setRatio(parseFloat(quoteRatio));
        setFromAmount(quoteAmountIn);
        setTransaction(routeTransaction);
      }
    }
  }

  // Swaps tokens with Uniswap V3 Router
  async function swap() {
    const approvalAmount = ethers.utils.parseUnits("10", DECIMALS).toString();
    const contract0 = new ethers.Contract(
      fromToken === "ETH" ? TOKENS["WETH"].address : TOKENS[fromToken].address,
      erc20ABI,
      provider
    );
    await contract0
      .connect(signer as Signer)
      .approve(V3_SWAP_ROUTER, approvalAmount);

    const send: any = signer?.sendTransaction(transaction);

    return send;
  }

  // Wrap ETH
  const wrap = useContractWrite({
    addressOrName: TOKENS["WETH"].address,
    contractInterface: WETH_ABI,
    functionName: "deposit",
    overrides: {
      value: ethers.utils.parseEther(fromAmount ? fromAmount : "0"),
    },
    signerOrProvider: signer,
  });

  // Unwrap ETH
  const unwrap = useContractWrite({
    addressOrName: TOKENS["WETH"].address,
    contractInterface: WETH_ABI,
    functionName: "withdraw",
    args: [ethers.utils.parseEther(toAmount ? toAmount : "0")],
    signerOrProvider: signer,
  });

  // Checks balance for sufficient funds
  function checkBalance() {
    if (fromAmount) {
      switch (fromToken) {
        case "ETH":
          if (
            parseFloat(fromAmount) <
            parseFloat(ethBalance.data ? ethBalance.data.formatted : "0")
          )
            return true;
          break;
        case "WETH":
          if (
            parseFloat(fromAmount) <
            parseFloat(wethBalance.data ? wethBalance.data.formatted : "0")
          )
            return true;
          break;
        case "UNI":
          if (
            parseFloat(fromAmount) <
            parseFloat(uniBalance.data ? uniBalance.data.formatted : "0")
          )
            return true;
          break;
        default:
          return false;
      }
    }
    return false;
  }

  // Handles the state of the swap process
  useEffect(() => {
    // If wallet is connected
    if (address) {
      // If there is a swap ratio
      if (ratio) {
        // Check token balances for sufficient funds
        if (checkBalance()) {
          // If there is a route
          if (transaction) {
            // Wrap and Swap
            if (fromToken === "ETH") setState(State.WRAP_AND_SWAP);
            // Swap and Unwrap
            else if (toToken === "ETH") setState(State.SWAP_AND_UNWRAP);
            // Swap
            else setState(State.SWAP);
          }
          // Just wrapping or unwrapping (no swapping)
          else {
            if (fromToken === "ETH") setState(State.WRAP);
            else if (toToken === "ETH") setState(State.UNWRAP);
          }
        } else setState(State.INSUFFICIENT_BALANCE);
      } else setState(State.SET_AMOUNT);
    } else setState(State.CONNECT_WALLET);
  }, [address, transaction, ratio, fromToken, toToken, fromAmount]);

  return (
    <div className="w-full h-screen p-8">
      <Toaster position="bottom-right" />
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
              value={fromAmount ? fromAmount : ""}
              onKeyUp={() => getExactInputQuote()}
              onChange={(e) => {
                if (e.target.value.length < 1) {
                  setFromAmount("");
                  setToAmount("");
                  setTransaction(undefined);
                  setRatio(undefined);
                } else setFromAmount(e.target.value);
              }}
              onWheel={(e: any) => e.target.blur()}
              type="number"
              className="h-full w-full mr-4 bg-transparent outline-none  text-3xl text-[#7E7E7E]"
            />
            <div>
              <select
                value={fromToken}
                onChange={(e) => {
                  // Clear fields and transaction data
                  setFromAmount("");
                  setToAmount("");
                  setTransaction(undefined);
                  setRatio(undefined);

                  // Reverse token inputs and outputs
                  if (toToken === e.target.value) setToToken(fromToken);
                  setFromToken(e.target.value);
                }}
                className="outline-none flex flex-col text-3xl font-medium text-right bg-transparent text-[#7E7E7E]"
              >
                <option value="ETH">ETH</option>
                <option value="UNI">UNI</option>
                <option value="WETH">WETH</option>
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
              value={toAmount ? toAmount : ""}
              onChange={(e) => {
                if (e.target.value.length < 1) {
                  setFromAmount("");
                  setToAmount("");
                  setTransaction(undefined);
                  setRatio(undefined);
                  console.log("Uh Hello??");
                } else setToAmount(e.target.value);
              }}
              onKeyUp={() => getExactOutputQuote()}
              onWheel={(e: any) => e.target.blur()}
              type="number"
              className="h-full w-full  mr-4  bg-transparent outline-none text-3xl text-[#7E7E7E]"
            />
            <div className="flex flex-col">
              <select
                value={toToken}
                onChange={(e) => {
                  // Clear fields and transaction data
                  setFromAmount("");
                  setToAmount("");
                  setTransaction(undefined);
                  setRatio(undefined);

                  // Reverse token inputs and outputs
                  if (fromToken === e.target.value) setFromToken(toToken);
                  setToToken(e.target.value);
                }}
                className=" outline-none flex flex-col text-3xl font-medium text-right bg-transparent text-[#7E7E7E]"
              >
                <option value="UNI">UNI</option>
                <option value="WETH">WETH</option>
                <option value="ETH">ETH</option>
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
          {(fromAmount || toAmount) &&
          (parseFloat(fromAmount) > 0 || parseFloat(toAmount) > 0) ? (
            <div className={`mt-2 flex items-center`}>
              {ratio !== undefined || (
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
          ) : (
            ""
          )}
          <ConnectButton.Custom>
            {({ account, openConnectModal, mounted }) => (
              <button
                onClick={() => {
                  switch (state) {
                    case State.CONNECT_WALLET:
                      openConnectModal();
                      break;
                    case State.SWAP:
                      // Swap
                      swap().then((e) => {
                        toast.promise(e.wait(1), {
                          loading: `Swapping ${fromToken} for ${toToken}`,
                          success: `Successfully Swapped ${fromToken} for ${toToken}`,
                          error: `Error Swapping ${fromToken} for ${toToken}`,
                        });

                        // Clear transaction data
                        e.wait(1).then(() => {
                          setFromAmount("");
                          setToAmount("");
                          setRatio(undefined);
                          setTransaction(undefined);
                        });
                      });
                      break;
                    case State.WRAP:
                      // Wrap
                      wrap.writeAsync().then((e) => {
                        toast.promise(e.wait(1), {
                          loading: "Wrapping ETH",
                          success: "Successfully Wrapped ETH",
                          error: "Error Wrapping ETH",
                        });

                        // Clear transaction data
                        e.wait(1).then(() => {
                          setFromAmount("");
                          setToAmount("");
                          setRatio(undefined);
                          setTransaction(undefined);
                        });
                      });
                      break;
                    case State.WRAP_AND_SWAP:
                      // Wrap
                      wrap.writeAsync().then((e) => {
                        toast.promise(e.wait(1), {
                          loading: "Wrapping ETH",
                          success: "Successfully Wrapped ETH",
                          error: "Error Wrapping ETH",
                        });
                        // Swap
                        e.wait(1).then(() =>
                          swap().then((f) => {
                            toast.promise(f.wait(1), {
                              loading: `Swapping ${fromToken} for ${toToken}`,
                              success: `Successfully Swapped ${fromToken} for ${toToken}`,
                              error: `Error Swapping ${fromToken} for ${toToken}`,
                            });

                            // Clear transaction data
                            f.wait(1).then(() => {
                              setFromAmount("");
                              setToAmount("");
                              setRatio(undefined);
                              setTransaction(undefined);
                            });
                          })
                        );
                      });
                      break;
                    case State.UNWRAP:
                      // Unwrap
                      unwrap.writeAsync().then((e) => {
                        toast.promise(e.wait(1), {
                          loading: "Unwrapping ETH",
                          success: "Successfully Unwrapped ETH",
                          error: "Error Unwrapping ETH",
                        });

                        // Clear transaction data
                        e.wait(1).then(() => {
                          setFromAmount("");
                          setToAmount("");
                          setRatio(undefined);
                          setTransaction(undefined);
                        });
                      });
                      break;
                    case State.SWAP_AND_UNWRAP:
                      // Swap
                      swap().then((e) => {
                        toast.promise(e.wait(1), {
                          loading: `Swapping ${fromToken} for ${toToken}`,
                          success: `Successfully Swapped ${fromToken} for ${toToken}`,
                          error: `Error Swapping ${fromToken} for ${toToken}`,
                        });
                        // Unwrap
                        e.wait(1).then(() =>
                          unwrap.writeAsync().then((f) => {
                            toast.promise(f.wait(1), {
                              loading: "Unwrapping ETH",
                              success: "Successfully Unwrapped ETH",
                              error: "Error Unwrapping ETH",
                            });
                            // Clear transaction data
                            f.wait(1).then(() => {
                              setFromAmount("");
                              setToAmount("");
                              setRatio(undefined);
                              setTransaction(undefined);
                            });
                          })
                        );
                      });
                      break;
                    default:
                      return false;
                  }
                }}
                className={`w-full h-[65px] mt-2 font-medium rounded-lg ${
                  state === State.SWAP ||
                  state === State.UNWRAP ||
                  state === State.WRAP ||
                  state === State.WRAP_AND_SWAP ||
                  state === State.SWAP_AND_UNWRAP
                    ? "bg-gradient-to-r from-[#C144F6] to-[#5149DA] text-white"
                    : state === State.INSUFFICIENT_BALANCE
                    ? "text-white bg-red-500"
                    : "text-white bg-[#aaaaaa]"
                } ${
                  state === State.INSUFFICIENT_BALANCE ||
                  state === State.SET_AMOUNT
                    ? "cursor-auto"
                    : "cursor-pointer"
                }`}
              >
                {state}
              </button>
            )}
          </ConnectButton.Custom>
        </div>
        <small className="text-[#7E7E7E] absolute left-8 bottom-8">
          Backbone Swap utilizes Uniswap V3 and is intended for demo purposes
          only.{" "}
          <a
            href="https://goerlifaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5149DA] font-bold"
          >
            Goerli Faucet
          </a>
        </small>
      </main>
    </div>
  );
}
