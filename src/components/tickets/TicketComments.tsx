import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Send, Loader2, Pin, AlertTriangle, HelpCircle,
  CheckCircle, Reply, Pencil, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface TicketCommentsProps {
  ticketId: string;
  staffList?: { id: string; name: string }[];
}

export const TicketComments = ({ ticketId, staffList = [] }: TicketCommentsProps) => {
  const { user, userName, role } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = role === "admin";
  const isCoordinator = role === "coordinator";

  const fetchComments = async () => {
    const { data } = await supabase
      .from("ticket_comments")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true }) as any;
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel(`comments-${ticketId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ticket_comments", filter: `ticket_id=eq.${ticketId}` }, () => fetchComments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  const extractMentions = (text: string): string[] => {
    const matches = text.match(/@(\w+(?:\s\w+)?)/g);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setSubmitting(true);

    const mentions = extractMentions(content);
    const { error } = await supabase.from("ticket_comments").insert({
      ticket_id: ticketId,
      user_id: user.id,
      user_name: userName,
      user_role: role,
      parent_id: replyTo?.id || null,
      content: content.trim(),
      mentions,
      is_question: isQuestion,
      requires_response: isQuestion,
      is_urgent: isUrgent,
    } as any);

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setContent("");
    setReplyTo(null);
    setIsQuestion(false);
    setIsUrgent(false);
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;
    await supabase.from("ticket_comments").update({
      content: editContent.trim(),
      is_edited: true,
      updated_at: new Date().toISOString(),
    } as any).eq("id", id);
    setEditingId(null);
    setEditContent("");
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ticket_comments").update({
      is_deleted: true,
      deleted_by: user?.id,
      content: "[Comment deleted]",
    } as any).eq("id", id);
    fetchComments();
  };

  const handlePin = async (id: string, pinned: boolean) => {
    await supabase.from("ticket_comments").update({ is_pinned: !pinned } as any).eq("id", id);
    fetchComments();
  };

  const handleResolve = async (id: string) => {
    await supabase.from("ticket_comments").update({
      is_resolved: true,
      requires_response: false,
    } as any).eq("id", id);
    fetchComments();
  };

  const insertMention = (name: string) => {
    setContent(prev => prev + `@${name} `);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    const lastChar = value.slice(-1);
    if (lastChar === "@") setShowMentions(true);
    else if (value.slice(-2).includes(" ") || !value.includes("@")) setShowMentions(false);
  };

  const pinnedComments = comments.filter(c => c.is_pinned && !c.is_deleted);
  const unansweredQuestions = comments.filter(c => c.is_question && c.requires_response && !c.is_resolved && !c.is_deleted);
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const roleColors: Record<string, string> = {
    admin: "bg-destructive/10 text-destructive",
    coordinator: "bg-primary/10 text-primary",
    technician: "bg-muted text-muted-foreground",
  };

  const renderComment = (comment: any, depth = 0) => {
    if (comment.is_deleted && !isAdmin) return null;
    const replies = getReplies(comment.id);
    const canEdit = comment.user_id === user?.id && !comment.is_deleted;
    const canDelete = isAdmin || (comment.user_id === user?.id && !comment.is_deleted);
    const canPin = isAdmin;
    const canResolve = (isAdmin || isCoordinator) && comment.is_question && comment.requires_response;

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-4 border-l-2 border-border/30 pl-3" : ""}`}>
        <div className={`p-2.5 rounded-lg text-xs space-y-1 ${
          comment.is_deleted ? "opacity-50 bg-muted/10" :
          comment.is_urgent ? "bg-destructive/5 border border-destructive/20" :
          comment.is_question && comment.requires_response ? "bg-amber-500/5 border border-amber-500/20" :
          comment.is_pinned ? "bg-primary/5 border border-primary/20" :
          "bg-muted/20"
        }`}>
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{comment.user_name}</span>
            <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${roleColors[comment.user_role] || ""}`}>
              {comment.user_role}
            </Badge>
            {comment.is_pinned && <Pin className="h-2.5 w-2.5 text-primary" />}
            {comment.is_urgent && <AlertTriangle className="h-2.5 w-2.5 text-destructive" />}
            {comment.is_question && <HelpCircle className="h-2.5 w-2.5 text-amber-500" />}
            {comment.is_resolved && <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />}
            {comment.is_edited && <span className="text-[9px] text-muted-foreground">(edited)</span>}
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Content */}
          {editingId === comment.id ? (
            <div className="space-y-1">
              <Textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                className="text-xs min-h-[40px]" rows={2} />
              <div className="flex gap-1">
                <Button size="sm" variant="default" className="h-6 text-[10px]" onClick={() => handleEdit(comment.id)}>Save</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Tags for requires_response */}
          {comment.requires_response && !comment.is_resolved && (
            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30">
              ⚠ Requires Response
            </Badge>
          )}

          {/* Actions */}
          {!comment.is_deleted && editingId !== comment.id && (
            <div className="flex gap-1 pt-0.5">
              <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5 gap-0.5"
                onClick={() => { setReplyTo(comment); textareaRef.current?.focus(); }}>
                <Reply className="h-2.5 w-2.5" /> Reply
              </Button>
              {canEdit && (
                <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5 gap-0.5"
                  onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
                  <Pencil className="h-2.5 w-2.5" /> Edit
                </Button>
              )}
              {canDelete && (
                <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5 gap-0.5 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(comment.id)}>
                  <Trash2 className="h-2.5 w-2.5" /> Delete
                </Button>
              )}
              {canPin && (
                <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5 gap-0.5"
                  onClick={() => handlePin(comment.id, comment.is_pinned)}>
                  <Pin className="h-2.5 w-2.5" /> {comment.is_pinned ? "Unpin" : "Pin"}
                </Button>
              )}
              {canResolve && (
                <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5 gap-0.5 text-emerald-600"
                  onClick={() => handleResolve(comment.id)}>
                  <CheckCircle className="h-2.5 w-2.5" /> Resolve
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-1 space-y-1">
            {replies.map(r => renderComment(r, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Comments & Discussion ({comments.filter(c => !c.is_deleted).length})
          {unansweredQuestions.length > 0 && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1">{unansweredQuestions.length} unanswered</Badge>
          )}
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="space-y-2">
          {/* Pinned comments */}
          {pinnedComments.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Pin className="h-2.5 w-2.5" /> PINNED
              </p>
              {pinnedComments.map(c => renderComment(c))}
            </div>
          )}

          {/* All comments */}
          {loading ? (
            <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
          ) : rootComments.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-2">No comments yet. Start the discussion!</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {rootComments.filter(c => !c.is_pinned).map(c => renderComment(c))}
            </div>
          )}

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/20 rounded p-1.5">
              <Reply className="h-3 w-3" />
              <span>Replying to <strong>{replyTo.user_name}</strong></span>
              <button onClick={() => setReplyTo(null)} className="ml-auto text-destructive hover:underline">Cancel</button>
            </div>
          )}

          {/* Compose */}
          <div className="space-y-1.5 relative">
            <Textarea ref={textareaRef} value={content} onChange={e => handleContentChange(e.target.value)}
              placeholder="Add a comment... Use @name to mention" className="text-xs min-h-[48px]" rows={2} />

            {/* Mention dropdown */}
            {showMentions && staffList.length > 0 && (
              <div className="absolute bottom-full mb-1 left-0 bg-popover border border-border rounded-md shadow-lg z-50 max-h-32 overflow-y-auto w-48">
                {staffList.map(s => (
                  <button key={s.id} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    onClick={() => insertMention(s.name)}>
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {(isAdmin || isCoordinator) && (
                <>
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                    <input type="checkbox" checked={isQuestion} onChange={e => setIsQuestion(e.target.checked)}
                      className="h-3 w-3 rounded" />
                    <HelpCircle className="h-3 w-3 text-amber-500" /> Question
                  </label>
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                    <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)}
                      className="h-3 w-3 rounded" />
                    <AlertTriangle className="h-3 w-3 text-destructive" /> Urgent
                  </label>
                </>
              )}
              <Button size="sm" className="h-7 text-xs gap-1 ml-auto" onClick={handleSubmit} disabled={submitting || !content.trim()}>
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
