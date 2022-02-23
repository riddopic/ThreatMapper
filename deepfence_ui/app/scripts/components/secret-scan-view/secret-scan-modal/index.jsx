/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';
import { DetailModal } from '../../common/detail-modal';
import { DetailModalHeader } from '../../common/detail-modal/header';
import { KeyValueContent, ModalBody, Severiety } from '../../common/detail-modal/body';
import styles from './index.module.scss';
import { DagreGraph, formatApiDataForDagreGraph } from '../../common/dagre-graph';
import { getDocTopAttackPathsAction, toaster } from "../../../actions/app-actions";
import { convertDocumentToKeyValuePairs } from '../../common/detail-modal/utils';


export const SecretScanModal = ({
  data,
  onRequestClose,
}) => {
  const source = data._source;
  const dispatch = useDispatch();
  const topAttackPathsForDoc = useSelector((state) => state.getIn(['topAttackPathsForDoc', 'data']));

  useEffect(() => {
    if (source?.doc_id) {
      dispatch(getDocTopAttackPathsAction({
        docId: source.doc_id
      }))
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    navigator?.clipboard?.writeText(JSON.stringify(source)).then(() => {
      dispatch(toaster('JSON copied to clipboard'));
    }).catch((error) => {
      console.log(error);
      dispatch(toaster('ERROR: There was an error copying to the clipboard'));
    });
  }, []);

  return (
    <DetailModal isOpen onRequestClose={onRequestClose}>
      <DetailModalHeader
        onRequestClose={onRequestClose}
        data={[{
          key: <div>ID</div>,
          value: <div>{source?._id}</div>,
          valueAsText: source?._id ?? ''
        }, {
          key: <div>Severity</div>,
          value: <Severiety severiety={source?._source.Severity.level.toLowerCase()} />,
          valueAsText: source?._source.Severity.level ?? ''
        }, {
          key: <div>Last Seen At</div>,
          value: <div>{source?._source['@timestamp'] ? moment(source?._source['@timestamp']).fromNow() : ''}</div>,
          valueAsText: source?._source['@timestamp'] ?? ''
        }]}
        actions={[
          {
            title: 'Copy as JSON',
            onClick: copyToClipboard,
            label: 'Copy as JSON',
            icon: <i className='fa fa-copy' />
          }
        ]}
      />
      <ModalBody>
        <div className={styles.modalBodyColumnsWrapper}>
          <div className={styles.modalBodyColumn}>
            <KeyValueContent data={convertDocumentToKeyValuePairs(source, 
            ['@timestamp', 'type', 'cve_overall_score', 'cve_id', 'cve_severity', 'doc_id'], 
            [
              'cve_container_image',
              'host_name',
              'cve_attack_vector',
              'cve_cvss_score',
              'cve_description',
              'cve_fixed_in',
              'cve_link',
              'cve_type',
              'cve_caused_by_package_path',
            ])}
              topRightVisualization={{
                title: 'Top 5 Attack Paths',
                visualization: topAttackPathsForDoc
                  && topAttackPathsForDoc.attack_path
                  && topAttackPathsForDoc.attack_path.length ? (
                  <div className={styles.attackPathGraph}>
                    <DagreGraph
                      data={formatApiDataForDagreGraph(topAttackPathsForDoc)}
                    />
                  </div>
                ) : <div className={styles.attackPathNoDataText}>No attack paths exist</div>
              }}
            />
          </div>
        </div>
      </ModalBody>
    </DetailModal>
  )
}

