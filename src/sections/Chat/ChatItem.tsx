import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactTimeago from 'react-timeago';
import { FaCopy } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { animationPropsSlide } from '../../animationSettings';
import { ChatItemModel } from '../../types/Models';
import { StateType } from '../../reducers';

export interface ChatItemProps {
  item: ChatItemModel;
}

const ChatItem: React.FC<ChatItemProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const client = useSelector((state: StateType) =>
    state.network?.find(client => client.clientId === item.clientId)
  );

  useLayoutEffect(() => {
    if (messageRef.current!.offsetHeight < 50) {
      setExpanded(true);
    }
  }, [setExpanded]);

  return (
    <motion.li
      className={'subsection info-grid ' + (expanded ? 'chat-expanded' : '')}
      {...animationPropsSlide}
      aria-label="Chat message"
    >
      <div className="chat-info">
        <div
          className="network-tile target-tile"
          style={{
            backgroundColor: item.clientColor,
          }}
        />
        <div>{client?.clientName}</div>
        <div>
          <ReactTimeago date={item.date} />
        </div>
        <CopyToClipboard text={item.message}>
          <button className="icon-button">
            <FaCopy />
          </button>
        </CopyToClipboard>
      </div>
      <div className="chat-message" ref={messageRef}>
        {item.message}
      </div>
      {!expanded && (
        <button className="chat-message-more" onClick={() => setExpanded(true)}>
          Show more
        </button>
      )}
    </motion.li>
  );
};

export default ChatItem;