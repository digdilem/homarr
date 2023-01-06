/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Group } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconRefresh,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons';
import axios from 'axios';
import Dockerode from 'dockerode';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { TFunction } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { openContextModalGeneric } from '../../../../../tools/mantineModalManagerExtensions';
import { AppType } from '../../../../../types/app';

let t: TFunction<'modules/docker', undefined>;

function sendDockerCommand(
  action: string,
  containerId: string,
  containerName: string,
  reload: () => void
) {
  showNotification({
    id: containerId,
    loading: true,
    title: `${t(`actions.${action}.start`)} ${containerName}`,
    message: undefined,
    autoClose: false,
    disallowClose: true,
  });
  axios
    .get(`/api/docker/container/${containerId}?action=${action}`)
    .then((res) => {
      updateNotification({
        id: containerId,
        title: containerName,
        message: `${t(`actions.${action}.end`)} ${containerName}`,
        icon: <IconCheck />,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      updateNotification({
        id: containerId,
        color: 'red',
        title: t('errors.unknownError.title'),
        message: err.response.data.reason,
        autoClose: 2000,
      });
    })
    .finally(() => {
      reload();
    });
}

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  t = useTranslation('modules/docker').t;
  const [isLoading, setisLoading] = useState(false);

  return (
    <Group spacing="xs">
      <Button
        leftIcon={<IconRefresh />}
        onClick={() => {
          setisLoading(true);
          setTimeout(() => {
            reload();
            setisLoading(false);
          }, 750);
        }}
        variant="light"
        color="violet"
        loading={isLoading}
        radius="md"
      >
        {t('actionBar.refreshData.title')}
      </Button>
      <Button
        leftIcon={<IconRotateClockwise />}
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('restart', container.Id, container.Names[0].substring(1), reload)
            )
          )
        }
        variant="light"
        color="orange"
        radius="md"
        disabled={selected.length === 0}
      >
        {t('actionBar.restart.title')}
      </Button>
      <Button
        leftIcon={<IconPlayerStop />}
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('stop', container.Id, container.Names[0].substring(1), reload)
            )
          )
        }
        variant="light"
        color="red"
        radius="md"
        disabled={selected.length === 0}
      >
        {t('actionBar.stop.title')}
      </Button>
      <Button
        leftIcon={<IconPlayerPlay />}
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('start', container.Id, container.Names[0].substring(1), reload)
            )
          )
        }
        variant="light"
        color="green"
        radius="md"
        disabled={selected.length === 0}
      >
        {t('actionBar.start.title')}
      </Button>
      <Button
        leftIcon={<IconTrash />}
        color="red"
        variant="light"
        radius="md"
        onClick={() =>
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('remove', container.Id, container.Names[0].substring(1), reload)
            )
          )
        }
        disabled={selected.length === 0}
      >
        {t('actionBar.remove.title')}
      </Button>
      <Button
        leftIcon={<IconPlus />}
        color="indigo"
        variant="light"
        radius="md"
        disabled={selected.length === 0 || selected.length > 1}
        onClick={() => {
          const containerUrl = `http://localhost:${selected[0].Ports[0].PublicPort}`;
          openContextModalGeneric<{ service: AppType }>({
            modal: 'editService',
            innerProps: {
              service: {
                id: uuidv4(),
                name: selected[0].Names[0],
                url: containerUrl,
                appearance: {
                  iconUrl: '/imgs/logo/logo.png', // TODO: find icon automatically
                },
                network: {
                  enabledStatusChecker: false,
                  okStatus: [],
                },
                behaviour: {
                  isOpeningNewTab: true,
                  externalUrl: '',
                },
                area: {
                  type: 'sidebar', // TODO: Set the wrapper automatically
                  properties: {
                    location: 'right',
                  },
                },
                shape: {
                  lg: {
                    location: {
                      x: 0,
                      y: 0,
                    },
                    size: {
                      height: 1,
                      width: 1,
                    },
                  },
                  md: {
                    location: {
                      x: 0,
                      y: 0,
                    },
                    size: {
                      height: 1,
                      width: 1,
                    },
                  },
                  sm: {
                    location: {
                      x: 0,
                      y: 0,
                    },
                    size: {
                      height: 1,
                      width: 1,
                    },
                  },
                },
                integration: {
                  type: null,
                  properties: [],
                },
              },
            },
          });
        }}
      >
        {t('actionBar.addToHomarr.title')}
      </Button>
    </Group>
  );
}
