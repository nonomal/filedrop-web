import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { motion } from 'framer-motion';

import { ActionType } from '../types/ActionType';
import { TransferModel } from '../types/Models';
import { TransferState } from '../types/TransferState';
import TransferIcon from './TransferIcon';

const states = {
    [TransferState.INCOMING]: 'Incoming',
    [TransferState.OUTGOING]: 'Outgoing',
    [TransferState.CONNECTING]: 'Connecting...',
    [TransferState.CONNECTED]: 'Connected!',
    [TransferState.IN_PROGRESS]: 'In progress...',
    [TransferState.COMPLETE]: 'Complete!',
    [TransferState.FAILED]: 'Failed!',
};

const cancellableStates = [
    TransferState.IN_PROGRESS,
    TransferState.CONNECTING,
    TransferState.CONNECTED,
    TransferState.OUTGOING,
];

const Transfer: React.FC<{
    transfer: TransferModel,
}> = ({ transfer }) => {
    const dispatch = useDispatch();
    const [ copied, setCopied ] = useState(false);
    const [ text, setText ] = useState('');
    
    const acceptTransfer = useCallback(() => dispatch({ type: ActionType.ACCEPT_TRANSFER, value: transfer.transferId }), [ transfer, dispatch ]);
    const rejectTransfer = useCallback(() => dispatch({ type: ActionType.REJECT_TRANSFER, value: transfer.transferId }), [ transfer, dispatch ]);
    const cancelTransfer = useCallback(() => dispatch({ type: ActionType.CANCEL_TRANSFER, value: transfer.transferId }), [ transfer, dispatch ]);
    const dismissTransfer = useCallback(() => dispatch({ type: ActionType.REMOVE_TRANSFER, value: transfer.transferId }), [ transfer, dispatch ]);

    useEffect(() => {
        setCopied(false);
    }, [ transfer.blobUrl, setCopied ]);

    useEffect(() => {
        if (transfer.fileType === 'text/plain' && transfer.blobUrl) {
            fetch(transfer.blobUrl)
                .then((res) => res.text())
                .then((text) => setText(text));
        }
    }, [ transfer ]);

    const onCopy = useCallback(() => setCopied(true), [ setCopied ]);

    const animationProps = {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 },
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20,
        },
        positionTransition: true,
    };

    return (
        <motion.li className="subsection" {...animationProps}>
            <TransferIcon transfer={transfer} />
            <div className="transfer-info">
                <div>
                    { transfer.fileName }
                </div>
                <div>
                    { states[transfer.state] }
                </div>
            </div>
            { transfer.state === TransferState.IN_PROGRESS ?
            <>
                <progress value={transfer.progress} max={1} />
                <div>{ Math.round(transfer.speed / 1000) } kB/s</div>
            </> : null }
            { transfer.state === TransferState.COMPLETE && transfer.blobUrl ?
            <>
                <a className="button" href={transfer.blobUrl} download={transfer.fileName}>Redownload</a>
                { transfer.fileType === 'text/plain' ?
                    <CopyToClipboard
                        text={text}
                        onCopy={onCopy}
                    >
                        <button>
                            { copied ? 'Copied' : 'Copy to clipboard' }
                        </button>
                    </CopyToClipboard>
                : null }
            </>
            : null }
            { transfer.state === TransferState.COMPLETE || transfer.state === TransferState.FAILED ?
                <button onClick={dismissTransfer}>Dismiss</button>
            : null }
            { transfer.state === TransferState.INCOMING ? 
            <>
                <button onClick={acceptTransfer}>Accept</button>
                <button onClick={rejectTransfer}>Reject</button>
            </> : null }
            { cancellableStates.includes(transfer.state) ?
                <button onClick={cancelTransfer}>Cancel</button>
            : null }
        </motion.li>
    );
}

export default Transfer;
