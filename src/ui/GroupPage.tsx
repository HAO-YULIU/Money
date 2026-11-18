import type { Group } from '../domain/types';

type Props = { group: Group; readOnly: boolean; onChange?: (g: Group) => void };

export default function GroupPage({ group }: Props) {
  return (
    <section>
      <h1>{group.name}</h1>
    </section>
  );
}
