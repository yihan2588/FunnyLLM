import { requireAdmin } from "@/lib/admin";
import { Confirmation, OperationForm } from "../components/forms";

type Taste = {version: string; emoji: string; label: string; prompt: string};

function TasteFields({taste}: {taste?: Taste}) {
  return <>
    <label>Emoji<input name="emoji" required maxLength={64} defaultValue={taste?.emoji} placeholder="🌀" /></label>
    <label>Button label<input name="label" required maxLength={24} defaultValue={taste?.label} placeholder="Surreal" /></label>
    <label>Writing direction<textarea name="prompt" required maxLength={600} rows={3} defaultValue={taste?.prompt} placeholder="Give an everyday object an impossible job. Let one concrete detail make the absurdity feel inevitable." /></label>
  </>;
}

export async function WorkflowTastes() {
  const {client} = await requireAdmin();
  const {data, error} = await client.rpc("funny_admin_tastes", {p_action:"list"});
  if (error) return <section className="section-block"><h2>Joke tastes</h2><p role="alert">The taste menu could not be loaded. Refresh to try again.</p></section>;
  const tastes = data as Taste[];
  return <section className="section-block" id="tastes">
    <div className="row-heading"><h2>Joke tastes</h2><span>{tastes.length} / 5</span></div>
    <p>Give each lab button a distinct comic move. New drafts use your changes. Saved drafts keep their original direction.</p>
    {tastes.map(taste=><article key={taste.version} className="model-row">
      <div><h3>{taste.emoji} {taste.label}</h3><p>{taste.prompt}</p></div>
      <div><details><summary>Edit {taste.label}</summary>
        <OperationForm action="taste_save" id={taste.version}><TasteFields taste={taste}/></OperationForm>
      </details><details><summary>Delete {taste.label}</summary>
        <OperationForm action="taste_delete" id={taste.version} label="Delete taste"><Confirmation>Remove {taste.label} from the lab.</Confirmation></OperationForm>
      </details></div>
    </article>)}
    {tastes.length<5 && <details key={tastes.length}><summary>Add a taste</summary>
      <OperationForm action="taste_save" label="Add taste"><TasteFields/></OperationForm>
    </details>}
  </section>;
}
