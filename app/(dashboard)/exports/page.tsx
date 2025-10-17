"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, Loader2, Trash2, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from 'sweetalert2';

interface Brief {
  id: string;
  topic: string;
  created_at: string;
  target_specs?: {
    wordCount?: string;
  };
}

export default function ExportsPage() {
  const router = useRouter();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBriefs();
  }, []);

  // Filter and sort briefs when search or sort changes
  useEffect(() => {
    let filtered = [...briefs];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(brief =>
        brief.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

    setFilteredBriefs(filtered);
  }, [briefs, searchQuery, sortBy]);

  const fetchBriefs = async () => {
    try {
      const response = await fetch('/api/briefs');
      const result = await response.json();
      
      if (result.success) {
        setBriefs(result.briefs);
      } else {
        setError('Failed to load briefs');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error loading briefs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, topic: string) => {
    const result = await Swal.fire({
      title: 'Delete Brief?',
      text: `Are you sure you want to delete "${topic}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-xl',
        title: 'text-gray-900',
        text: 'text-gray-600'
      }
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        const response = await fetch(`/api/briefs/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          setBriefs(briefs.filter(b => b.id !== id));
          
          // Show success message
          Swal.fire({
            title: 'Deleted!',
            text: 'Your brief has been deleted.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#ffffff',
            customClass: {
              popup: 'rounded-xl',
              title: 'text-gray-900'
            }
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete brief. Please try again.',
            icon: 'error',
            background: '#ffffff',
            customClass: {
              popup: 'rounded-xl',
              title: 'text-gray-900'
            }
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while deleting the brief.',
          icon: 'error',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-xl',
            title: 'text-gray-900'
          }
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2">My Exports</h1>
        <p className="text-muted-foreground">
          View and download your exported blog briefs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search briefs by topic..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                Sort by: {sortBy === "recent" ? "Recent" : "Oldest"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Recent First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="rounded-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchBriefs}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && briefs.length === 0 && (
        <Card className="rounded-xl">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">
              No briefs created yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first brief to get started
            </p>
            <Button onClick={() => router.push('/find')}>
              Create Your First Brief
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!loading && !error && briefs.length > 0 && filteredBriefs.length === 0 && (
        <Card className="rounded-xl">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">
              No briefs found
            </h3>
            <p className="text-muted-foreground mb-4">
              No briefs match your search: &ldquo;{searchQuery}&rdquo;
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Briefs Grid */}
      {!loading && !error && filteredBriefs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBriefs.map((brief) => (
            <Card key={brief.id} className="rounded-xl hover:shadow-lg transition-shadow flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="mb-4 flex-1">
                  <h3 className="font-semibold text-secondary mb-2 line-clamp-2">
                    {brief.topic}
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Created {formatDate(brief.created_at)}</div>
                    {brief.target_specs?.wordCount && (
                      <div>{brief.target_specs.wordCount}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push(`/brief/${brief.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => handleDelete(brief.id, brief.topic)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* Export Formats Info */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Export Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary">PDF Export</h3>
                <p className="text-sm text-muted-foreground">
                  Download briefs as professional PDF documents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg opacity-50">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary">Google Docs</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg opacity-50">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary">Notion</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
