import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authLogout, createNoteApi, deleteNoteById, listNotes, searchNotesByTags, type Note } from '@/lib/api';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotes();
      setNotes(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createNote() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const t = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await createNoteApi({ title, content, tags: t });
      setTitle('');
      setContent('');
      setTags('');
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  async function removeNote(id: number) {
    try {
      await deleteNoteById(id);
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Delete failed');
    }
  }

  async function doSearchByTags() {
    if (!filter) {
      await loadAll();
      return;
    }
    try {
      const data = await searchNotesByTags(filter);
      setNotes(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Search failed');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">QuickNotes</h1>
          <Button variant="outline" onClick={() => { authLogout(); onLogout(); }}>
            Logout
          </Button>
        </div>

        {/* Search/Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Notes</CardTitle>
            <CardDescription>Filter notes by tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Filter by tags: work,personal"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1"
              />
              <Button onClick={doSearchByTags}>Search</Button>
              <Button variant="outline" onClick={loadAll}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Note Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
            <CardDescription>Add a new note to your collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter note content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <Button disabled={loading || !title.trim()} onClick={createNote} className="w-full">
              {loading ? 'Creating...' : 'Create Note'}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Notes ({notes.length})</h2>
          {notes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No notes found. Create your first note above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeNote(note.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {note.content || 'No content'}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 