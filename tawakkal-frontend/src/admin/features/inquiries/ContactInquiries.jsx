import { useState, useEffect } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import { ContentCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { getMessages, replyToMessage, clearMessages } from '../../services/api';
import { formatRelativeDate } from '../../utils/formatters';

export default function ContactInquiries() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => { (async () => { try { const data = await getMessages(); setMessages(data); } finally { setLoading(false); } })(); }, []);

  const filtered = messages.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && m.status !== filter) return false;
    return true;
  });

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await replyToMessage(selected.id, reply);
      toast.success('Reply sent', `Your reply to ${selected.name} has been sent.`);
      setReply('');
      const res = await getMessages();
      setMessages(res);
      setSelected(res.find(m => m.id === selected.id) || null);
    } catch (e) {
      toast.error('Failed to reply', e.response?.data?.message || 'There was an error sending your reply.');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all inquiries?")) {
      try {
        await clearMessages();
        setMessages([]);
        setSelected(null);
        toast.success('Inquiries Cleared', 'All inquiries have been deleted.');
      } catch (e) {
        toast.error('Error', 'Failed to clear inquiries.');
      }
    }
  };

  const statusColors = { unread: 'info', replied: 'success' };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader title="Contact Inquiries" subtitle={`${messages.length} total messages`} breadcrumbs={[{ label: 'Inquiries' }]} />
        <Button variant="danger" onClick={handleClearAll}>Clear All</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '380px 1fr' : '1fr', gap: '20px', minHeight: '500px' }} className="admin-inbox">
        <style>{`@media(max-width:900px){.admin-inbox{grid-template-columns:1fr!important;}}`}</style>

        {/* Message List */}
        <ContentCard noPadding>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--admin-border-light)' }}>
            <Input placeholder="Search messages..." icon={HiOutlineMagnifyingGlass} value={search} onChange={(e) => setSearch(e.target.value)} size="sm" />
            <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
              {['', 'unread', 'replied'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '4px 10px', borderRadius: 'var(--admin-radius-full)', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  background: filter === f ? 'var(--admin-primary)' : 'var(--admin-surface-secondary)',
                  color: filter === f ? 'white' : 'var(--admin-text-secondary)',
                  fontFamily: 'var(--admin-font-sans)', textTransform: 'capitalize',
                }}>
                  {f || 'All'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
            {loading ? <TableSkeleton rows={4} columns={2} /> : filtered.length === 0 ? <EmptyState title="No messages" /> :
              filtered.map(msg => (
                <div key={msg.id} onClick={() => setSelected(msg)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px',
                  borderBottom: '1px solid var(--admin-border-light)', cursor: 'pointer',
                  background: selected?.id === msg.id ? 'var(--admin-primary-50)' : msg.status === 'unread' ? 'var(--admin-surface-secondary)' : 'transparent',
                  transition: 'background var(--admin-transition-fast)',
                }}>
                  <Avatar name={msg.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <p style={{ fontSize: '13px', fontWeight: msg.status === 'unread' ? 700 : 500, color: 'var(--admin-text)', margin: 0 }}>{msg.name}</p>
                      <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', flexShrink: 0 }}>{formatRelativeDate(msg.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.subject}</p>
                    <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</p>
                  </div>
                </div>
              ))}
          </div>
        </ContentCard>

        {/* Message Detail */}
        {selected && (
          <ContentCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-text)', fontFamily: 'var(--admin-font-display)', margin: '0 0 4px' }}>{selected.subject}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>From: {selected.name} ({selected.email})</span>
                  <Badge variant={statusColors[selected.status]} size="xs">{selected.status}</Badge>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{formatRelativeDate(selected.createdAt)}</span>
            </div>
            <div style={{ padding: '20px', background: 'var(--admin-surface-secondary)', borderRadius: 'var(--admin-radius-lg)', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--admin-text)', lineHeight: 1.7, margin: 0 }}>{selected.message}</p>
            </div>
            <div style={{ borderTop: '1px solid var(--admin-border-light)', paddingTop: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '10px' }}>Reply</p>
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply..." rows={4} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button icon={HiOutlinePaperAirplane} onClick={handleReply}>Send Reply</Button>
              </div>
            </div>
          </ContentCard>
        )}
      </div>
    </PageContainer>
  );
}
