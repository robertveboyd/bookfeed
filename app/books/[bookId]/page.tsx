import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book",
}

export default async function Page({
    params,
}: {
    params: Promise<{ bookId: string}>
}){
    const { bookId } = await params;
    return (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Book detail</h1>
          <p className="text-muted-foreground">
            Placeholder for book <code className="font-mono">{bookId}</code>.
          </p>
        </div>
      )
}