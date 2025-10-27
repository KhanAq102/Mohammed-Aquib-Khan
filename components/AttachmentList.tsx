import React from 'react';
import { Attachment, AttachmentType } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { LinkIcon } from './icons/LinkIcon';

interface AttachmentListProps {
    attachments: Attachment[];
    tenderId: string;
    onDeleteAttachment: (tenderId: string, attachmentId: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, tenderId, onDeleteAttachment }) => {
    if (attachments.length === 0) {
        return <p className="text-center text-slate-500 py-4">No attachments have been added to this tender yet.</p>;
    }

    return (
        <div className="divide-y divide-slate-200">
            {attachments.map((attachment) => (
                <div key={attachment.id} className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 text-slate-400">
                            {attachment.type === AttachmentType.Link ? (
                                <LinkIcon className="h-5 w-5" />
                            ) : (
                                <PaperClipIcon className="h-5 w-5" />
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            {attachment.type === AttachmentType.Link ? (
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate"
                                    title={attachment.url}
                                >
                                    {attachment.name}
                                </a>
                            ) : (
                                <span className="text-sm text-slate-700 truncate" title={attachment.name}>
                                    {attachment.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => onDeleteAttachment(tenderId, attachment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Attachment"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AttachmentList;