'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl'; // 1. IMPORTAR EL HOOK

import { AuthButton } from '@/components/AuthButton';
import { Verify } from '@/components/Verify';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const NUEVA_DIRECCION_CONTRATO = "0x44633AF3747b364D989D2f3FB9B3857c25aaC4aa";
const NUEVO_ABI_CONTRATO = [{"inputs":[{"internalType":"address","name":"_rewardToken","type":"address"},{"internalType":"uint256","name":"_initialReferrerReward","type":"uint256"},{"internalType":"uint256","name":"_initialWelcomeBonus","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referee","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"}],"name":"ReferrerCredited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newReferrerAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newWelcomeBonus","type":"uint256"}],"name":"RewardAmountUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardsCount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referee","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WelcomeBonusSent","type":"event"},{"inputs":[],"name":"ADDRESS_BOOK","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canReward","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimMyRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"creditReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getRewardCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTop5","outputs":[{"internalType":"address[5]","name":"","type":"address[5]"},{"internalType":"uint256[5]","name":"","type":"uint256[5]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasCreditedReferrer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"referrerRewardAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rewardToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newReferrerAmount","type":"uint256"},{"internalType":"uint256","name":"_newWelcomeBonus","type":"uint256"}],"name":"setRewardAmounts","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"top5Addresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"top5Counts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"totalReferrals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"welcomeBonusAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const neonTextStyle = {
  textShadow: `
    0 0 5px rgba(0, 191, 255, 0.7),
    0 0 10px rgba(0, 191, 255, 0.7),
    0 0 20px rgba(0, 191, 255, 0.5),
    0 0 40px rgba(0, 191, 255, 0.3)
  `,
};

export default function CustomLoginPage() {
  const t = useTranslations('login_page'); // 2. INICIALIZAR EL HOOK
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [referrer, setReferrer] = useState<string | null>(null);
  const [referrerUsername, setReferrerUsername] = useState<string | null>(null);
  const [hasCredited, setHasCredited] = useState(false);

  const [uiState, setUiState] = useState<'loading' | 'confirming_referral' | 'verifying' | 'manual_login'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const refAddress = searchParams.get('ref');
    if (refAddress) {
      setReferrer(refAddress);
      MiniKit.getUserByAddress(refAddress).then(user => {
        setReferrerUsername(user?.username ?? refAddress.slice(0, 6) + '...');
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      if (referrer && !hasCredited) {
        setUiState('confirming_referral');
      } else {
        setUiState('verifying');
      }
      return;
    }

    if (status === 'unauthenticated' && uiState === 'loading') {
      const autoSignIn = async () => {
        try {
          const nonceRes = await fetch('/api/get-nonce');
          if (!nonceRes.ok) throw new Error("Error del servidor al obtener nonce.");
          const { nonce, signedNonce } = await nonceRes.json();

          const result = await MiniKit.commandsAsync.solvePoW_and_proveOwnership(nonce);
          if (!result.finalPayload) throw new Error("La prueba de propiedad falló.");

          const signInResponse = await signIn('credentials', {
            finalPayloadJson: JSON.stringify(result.finalPayload),
            nonce,
            signedNonce,
            redirect: false,
          });

          if (signInResponse?.error) {
            throw new Error(signInResponse.error);
          }
        } catch (error: any) {
          console.error("Fallo el auto-login:", error);
          setErrorMessage(t('auto_connect_error'));
          setUiState('manual_login');
        }
      };
      autoSignIn();
    }
  }, [status, uiState, referrer, hasCredited, t]);

  const handleConnectSuccess = () => {
    window.location.reload();
  };

  const handleVerificationSuccess = () => {
    router.push('/home');
  };

  const handleConfirmReferral = async () => {
    if (!referrer) return;
    try {
      await MiniKit.commandsAsync.sendTransaction({
        transaction: [{
          address: NUEVA_DIRECCION_CONTRATO,
          abi: NUEVO_ABI_CONTRATO,
          functionName: 'creditReferrer',
          args: [referrer as `0x${string}`],
        }],
      });
      setHasCredited(true);
      setUiState('verifying');
    } catch (err: any) {
      console.error("Referral credit failed:", err);
      setUiState('verifying');
    }
  };

  const renderContent = () => {
    switch (uiState) {
      case 'loading':
        return <p className="text-gray-300">{t('connecting_securely')}</p>;

      case 'confirming_referral':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-purple-300">
              {t.rich('confirm_referral_prompt', {
                username: referrerUsername || '...',
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
            <button onClick={handleConfirmReferral} className="w-full px-5 py-2 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700">
              {t('confirm_and_get_bonus_button')}
            </button>
            <button onClick={() => setUiState('verifying')} className="text-xs text-gray-400 hover:underline">
              {t('skip_button')}
            </button>
          </div>
        );

      case 'verifying':
        return <Verify onSuccess={handleVerificationSuccess} />;

      case 'manual_login':
        return (
          <>
            {errorMessage && <p className="text-red-400 text-sm mb-4">{errorMessage}</p>}
            <p className="text-gray-300">
              {t('connect_prompt')}
            </p>
            <AuthButton
              onConnectSuccess={handleConnectSuccess}
              className="bg-black rounded-lg p-4 border border-transparent hover:border-cyan-400 transition-all duration-300 group"
            >
              <span
                className="text-xl font-bold text-white transition-all duration-300 group-hover:text-cyan-300"
                style={neonTextStyle}
              >
                {t('connect_wallet_button')}
              </span>
            </AuthButton>
          </>
        );
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center text-center gap-10">
        <img
          src="https://gateway.pinata.cloud/ipfs/bafybeifaowdvqoruyazyhmxgbsjwtkkd5qfmuyefvnnisgp3f3enkwrvtq"
          alt="Logo de Destinity"
          className="w-64 h-auto"
        />
        <div className="w-full max-w-sm p-8 bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
