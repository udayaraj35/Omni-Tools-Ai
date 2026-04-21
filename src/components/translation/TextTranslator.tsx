
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateText } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Clipboard, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Moved from the flow file to be used only on the client
const languageCodes = {
  'Arabic': 'ar',
  'Chinese (Simplified)': 'zh-CN',
  'Chinese (Traditional)': 'zh-TW',
  'Danish': 'da',
  'Dutch': 'nl',
  'English': 'en',
  'Finnish': 'fi',
  'French': 'fr',
  'German': 'de',
  'Greek': 'el',
  'Hindi': 'hi',
  'Hungarian': 'hu',
  'Indonesian': 'id',
  'Italian': 'it',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Nepali': 'ne',
  'Norwegian': 'no',
  'Polish': 'pl',
  'Portuguese': 'pt',
  'Romanian': 'ro',
  'Russian': 'ru',
  'Spanish': 'es',
  'Swedish': 'sv',
  'Thai': 'th',
  'Turkish': 'tr',
  'Vietnamese': 'vi',
};

const TranslateTextInputSchema = z.object({
  text: z.string().min(1, 'Please enter some text to translate.'),
  targetLanguage: z.enum(Object.values(languageCodes) as [string, ...string[]]).describe('The language to translate the text into.'),
});


type TranslateFormData = z.infer<typeof TranslateTextInputSchema>;

export function TextTranslator() {
  const { toast } = useToast();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const form = useForm<TranslateFormData>({
    resolver: zodResolver(TranslateTextInputSchema),
    defaultValues: {
      text: '',
      targetLanguage: 'es', // Default to Spanish
    },
  });
  
  const handleTranslate = async (data: TranslateFormData) => {
    setIsLoading(true);
    setTranslatedText('');
    try {
      const result = await translateText(data);
      if ('translatedText' in result) {
        setTranslatedText(result.translatedText);
        toast({ title: 'Translation Successful!' });
      } else {
        throw new Error(result.error || 'AI did not return the expected content.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setHasCopied(true);
    toast({ title: 'Copied to Clipboard!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTranslate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel className="text-lg">Text to Translate</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={6}
                          placeholder="Enter the text you want to translate..."
                          className="bg-background/70 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Translate To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(languageCodes).map(([name, code]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full text-base h-12 gradient-button-gold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  Translate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || translatedText) && (
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Result</h3>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[150px]">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            ) : (
              <div className="relative">
                <div className="prose prose-invert max-w-none bg-background/50 p-4 rounded-md border min-h-[150px]">
                   <ReactMarkdown>{translatedText}</ReactMarkdown>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleCopy}
                >
                  {hasCopied ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
