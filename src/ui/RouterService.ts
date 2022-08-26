import { AlphaRouter } from "@uniswap/smart-order-router"
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core"
import {ethers, BigNumber} from "ethers";
import JSBI from "jsbi"
import { erc20ABI } from "wagmi";

const V3_SWAP_ROUTER = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const CHAIN_ID = 5
const DECIMALS = 18
const TOKEN_CONTRACTS = {
    "WETH": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
}
const WETH = new Token(CHAIN_ID, TOKEN_CONTRACTS["WETH"], DECIMALS, "WETH", "Wrapped Ether")
const UNI = new Token(CHAIN_ID, TOKEN_CONTRACTS["UNI"], DECIMALS, "UNI", "Uniswap")

const web3Provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_RPC)
const router = new AlphaRouter({ chainId: CHAIN_ID, provider: web3Provider })

export const getWethContract = () => new ethers.Contract(TOKEN_CONTRACTS["WETH"], erc20ABI, web3Provider)
export const getUniContract = () => new ethers.Contract(TOKEN_CONTRACTS["UNI"], erc20ABI, web3Provider)

export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
  const percentSlippage = new Percent(slippageAmount, 100)
  const wei = ethers.utils.parseUnits(inputAmount.toString(), DECIMALS)
  const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei))

  const route: any = await router.route(
    currencyAmount,
    UNI,
    TradeType.EXACT_INPUT,
    {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    }
  )

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER,
    value: BigNumber.from(route.methodParameters.value),
    from: walletAddress,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000)
  }

  const quoteAmountOut = route.quote.toFixed(6)
  const ratio = (inputAmount / quoteAmountOut).toFixed(3)

  return [
    transaction,
    quoteAmountOut,
    ratio
  ]
}

export const runSwap = async (transaction, signer) => {
  const approvalAmount = ethers.utils.parseUnits('10', 18).toString()
  const contract0 = getWethContract()
  await contract0.connect(signer).approve(
    V3_SWAP_ROUTER,
    approvalAmount
  )

  signer.sendTransaction(transaction)
}