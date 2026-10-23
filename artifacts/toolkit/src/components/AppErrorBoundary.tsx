import { Component, type ReactNode } from 'react';
export class AppErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){if(this.state.failed)return <main className="max-w-lg mx-auto p-8 space-y-4"><h1 className="text-2xl font-bold">This page could not load</h1><p>A new version may be available, or a required file could not be downloaded. Reload the page and try again. Unsaved tool inputs will be cleared.</p><button className="border rounded px-4 py-2" onClick={()=>window.location.reload()}>Reload page</button><p>If this continues, contact the site operator with the tool URL and browser version. Do not include private files or tokens.</p></main>;return this.props.children;}
}
