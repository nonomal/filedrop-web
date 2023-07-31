import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';
import { DeviceType, ClientModel } from '@filedrop/types';

import styles from './NetworkTile.module.scss';
import { createTransferAction } from '../actions/transfers';
import { animationPropsOpacity } from '../animationSettings';
import { StateType } from '../reducers';
import { motion } from '../animate';
import { TargetTile } from './TargetTile';

interface NetworkTileProps {
  client: ClientModel;
  onSelect?: (clientId: string) => void;
}

export const NetworkTile: React.FC<NetworkTileProps> = ({
  client,
  onSelect,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const publicKey = useSelector((state: StateType) => state.publicKey);

  const onDrop = (files: File[]) => {
    for (const file of files) {
      dispatch(createTransferAction(file, client.clientId));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const preventClick = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const onClick = () => {
    onSelect?.(client.clientId);
  };

  const dragProps = onSelect ? {} : getRootProps();

  return (
    <motion.div
      {...animationPropsOpacity}
      onClick={onClick}
      className={styles.wrapper}
    >
      <TargetTile
        {...dragProps}
        client={client}
        variant="big"
        className={clsx(styles.tile, { active: isDragActive })}
        secure={!!publicKey && !!client.publicKey}
        local={client.isLocal}
        mobile={client.deviceType === DeviceType.MOBILE}
      >
        {!onSelect && (
          <label onClick={preventClick}>
            <input
              {...getInputProps({
                style: {},
              })}
              accept={'*'}
              tabIndex={1}
            />
            {t('tile')}
          </label>
        )}
        <FaPlus className={styles.plus} />
      </TargetTile>
      <div className={styles.name}>{client.clientName}</div>
    </motion.div>
  );
};