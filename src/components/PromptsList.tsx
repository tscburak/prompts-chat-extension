import { usePrompts } from "@/lib/contexts/PromptsContext";
import { useMemo } from "react";
import { PromptCard } from "./PromptCard";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { List, Star } from "lucide-react";

export function PromptsList() {
  const { devMode, filteredPrompts, prompts, query: searchQuery, activeTab, setActiveTab, favorites } = usePrompts();
  const totalCount = prompts.length;
  const totalFavorites = favorites.size;
  
  const filteredFavorites = useMemo(() => {
    return filteredPrompts.filter(prompt => favorites.has(`${prompt.act}-${prompt.prompt}`));
  }, [filteredPrompts, favorites]);

  const displayedPrompts = useMemo(() => {
    return activeTab === 'favorites' ? filteredFavorites : filteredPrompts;
  }, [activeTab, filteredPrompts, filteredFavorites]);

  const filterDescription = useMemo(() => {
    const filteredCount = filteredPrompts.length;

    if (filteredCount === totalCount) {
      return `${filteredCount} prompts`;
    }
    return `Showing ${filteredCount} of ${totalCount} prompts${devMode ? ' (Developer Mode)' : ''}`;
  }, [filteredPrompts.length, totalCount, searchQuery, devMode]);

  const filterFavoritesDescription = useMemo(() => {
    const filteredFavoritesCount = filteredFavorites.length;
    if (filteredFavoritesCount === totalFavorites) {
      return `${filteredFavoritesCount} favorites`;
    }
    return `Showing ${filteredFavoritesCount} of ${totalFavorites} favorites${devMode ? ' (Developer Mode)' : ''}`;
  }, [filteredFavorites.length, totalFavorites, searchQuery, devMode]);

  return (
    <div className="space-y-4">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'all' | 'favorites')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            <div className="flex flex-row items-center justify-center gap-2">
              <List size={16} />
              All</div>
            </TabsTrigger>
          <TabsTrigger value="favorites"><div className="flex flex-row items-center justify-center gap-2">
              <Star size={16} />
              Favorites</div></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="px-1">
        <span className="text-sm text-muted-foreground">
          {activeTab==='all' ? filterDescription:filterFavoritesDescription}
        </span>
      </div>

      <div className="space-y-3">
        {displayedPrompts.length > 0 ? (
          displayedPrompts.map((prompt, index) => (
            <PromptCard
              key={`${prompt.act}-${index}`}
              act={prompt.act}
              prompt={prompt.prompt}
              contributor={prompt.contributor || '@f'}
              isFavorite={favorites.has(`${prompt.act}-${prompt.prompt}`)}
            />
          ))
        ) : (
          activeTab === "favorites" ? (
            <div className="text-center py-8 text-muted-foreground space-y-1">
              <p className="text-base font-medium">Your favorites list is empty</p>
              <p className="text-sm">Click the star icon on any prompt to save it here</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-1">
              <p className="text-base font-medium">No matching prompts</p>
              <p className="text-sm">Try different search terms or clear filters</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
