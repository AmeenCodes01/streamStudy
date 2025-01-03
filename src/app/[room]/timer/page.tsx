import SessionTimer from "./components/SessionTimer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Stream from "./components/Stream";

// hook gives all countdown functionality. handle end session/rat e session here.
function page() {
 
  return (
    <div className="w-full h-full flex flex-col sm:flex-row justify-center items-center sm:p-0 pt-8 ">
      {/* Video */}
      <div className="flex flex-1  w-full h-full">{/* Yt video embed, simple */}

      <Stream/>

      </div>
      {/* Timer */}
      <div className="flex flex-1  sm:justify-center items-center    ">

      <Tabs defaultValue="pomodoro" className="">
  <TabsList>
    <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
    <TabsTrigger value="record">Record</TabsTrigger>
  </TabsList>
  <TabsContent value="record">Make changes to your account here.</TabsContent>
  <TabsContent value="pomodoro">

      <SessionTimer/>
  </TabsContent>
</Tabs>
      </div>

   
    </div>
  );
}

export default page;
