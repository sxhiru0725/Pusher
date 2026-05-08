import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { Upload, GraduationCap, Activity, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <PageShell>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center space-y-8 py-16 md:py-24 lg:py-32">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Pusher
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground sm:text-2xl md:text-3xl font-light">
            Connect GitHub. Drag & drop projects. Level up your repos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" className="group h-12 px-8 text-base" asChild>
            <Link href="/auth/login">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Free forever • No credit card required
        </p>
      </section>

      {/* Feature Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 py-16 md:py-20">
        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow hover:border-primary/50">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Drop2Repo Uploader</CardTitle>
            <CardDescription className="text-base">
              Effortlessly upload and manage your projects with our intuitive
              drag-and-drop interface. Create GitHub repos in seconds.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow hover:border-primary/50">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">README Generator</CardTitle>
            <CardDescription className="text-base">
              Generate professional README.md files with live preview. Make your
              projects shine from day one.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow hover:border-primary/50">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Repo Health Checker</CardTitle>
            <CardDescription className="text-base">
              Analyze your repositories for health metrics, code quality, and
              improvement opportunities.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow hover:border-primary/50">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Student Learning Tips</CardTitle>
            <CardDescription className="text-base">
              Get personalized tips and best practices to improve your coding
              skills and repository management.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-20 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to transform your projects into professional
            GitHub repositories
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold">Connect GitHub</h3>
            <p className="text-muted-foreground">
              Sign in with your GitHub account in one click. We use OAuth for
              secure authentication.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold">Upload Your Project</h3>
            <p className="text-muted-foreground">
              Drag and drop your project folder. Select files, configure
              settings, and we handle the rest.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold">Manage & Improve</h3>
            <p className="text-muted-foreground">
              Generate READMEs, check repo health, and get tips to level up your
              repositories.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 border-t">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
            </div>
            <p className="text-muted-foreground">
              Upload and create repositories in seconds, not minutes.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-lg">Zero Configuration</h3>
            </div>
            <p className="text-muted-foreground">
              Smart defaults handle everything. Customize only what you need.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-lg">Always Free</h3>
            </div>
            <p className="text-muted-foreground">
              All features available at no cost. Perfect for students and
              professionals alike.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Join developers who are already using Pusher to streamline their
          workflow.
        </p>
        <Button size="lg" className="h-12 px-8 text-base" asChild>
          <Link href="/auth/login">
            Login with GitHub
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </PageShell>
  );
}
