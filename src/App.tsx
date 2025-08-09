import { Editor } from "./components/Editor"
import { TrashProvider } from "./context/TextContext"
const App = () => {
  return (
    <TrashProvider>
      <Editor />
    </TrashProvider>
  )
}

export default App
