'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { useVotingProgram } from './voting-data-access';
import { useState, useEffect, useRef } from 'react';
import { VotingCreatePoll, VotingPolls } from './voting-ui';

export default function VotingFeature() {
  const { publicKey } = useWallet();
  const { programId } = useVotingProgram();
  const [isVisible, setIsVisible] = useState(false);

  const handleHide = () => {
    setIsVisible(false);
  };

  return publicKey ? (
    <div>
      <AppHero title="Voting Platform" subtitle={'Welcome to voting platform'}>
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <button onClick={() => setIsVisible((prev) => !prev)} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md disabled:bg-gray-400">
          Create Poll
        </button>
        <AppModal show={isVisible} hide={handleHide} title="Enter the Poll Details">
          <VotingCreatePoll></VotingCreatePoll>
        </AppModal>
      </AppHero>
      <VotingPolls />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}

interface AppModalProps {
  children: React.ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}

const AppModal: React.FC<AppModalProps> = ({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show]);

  useEffect(() => {
    const handleBackdropClick = (event: MouseEvent) => {
      if (dialogRef.current && event.target === dialogRef.current) {
        hide();
      }
    };

    const dialogNode = dialogRef.current;
    if (dialogNode) {
      dialogNode.addEventListener('click', handleBackdropClick);
    }

    return () => {
      if (dialogNode) {
        dialogNode.removeEventListener('click', handleBackdropClick);
      }
    };
  }, [hide]);

  return (
    <div>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}
      <dialog
        ref={dialogRef}
        className="modal fixed inset-0 z-50 flex items-center justify-center p-4 rounded-lg shadow-lg backdrop-blur-sm"
      >
        <div className="modal-box space-y-5 p-6 rounded-lg shadow-lg">
          <h3 className="font-bold text-2xl">{title}</h3>
          {children}
          <div className="modal-action flex space-x-4">
            {submit && (
              <button
                className="btn btn-primary py-2 px-4 rounded-md bg-indigo-600 text-white"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </button>
            )}
            <button
              onClick={hide}
              className=" py-2 px-4 rounded-md bg-gray-500 text-white hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};