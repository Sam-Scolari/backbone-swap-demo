import { useAccount } from "wagmi";


export default function useSwap(token, amount) {
    const { address, isConnecting, isDisconnected } = useAccount();

    function swap() {

    }

    return swap;
}