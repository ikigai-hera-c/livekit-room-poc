'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { ParticipantRole } from '@/lib/talkback'

type EntryProfilePanelProps = {
  displayName: string
  role: ParticipantRole
  isOpeningManager: boolean
  onDisplayNameChange: (displayName: string) => void
  onRoleChange: (role: ParticipantRole) => void
  onOpenManager: () => void
}

export function EntryProfilePanel({
  displayName,
  role,
  isOpeningManager,
  onDisplayNameChange,
  onRoleChange,
  onOpenManager,
}: EntryProfilePanelProps) {
  return (
    <Card className="border-border/80 bg-card/70 shadow-none">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          My profile & settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="display-name">
            Display name
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>

          <Input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
            placeholder="Leave empty for a random name"
            autoComplete="name"
            maxLength={60}
          />
        </div>

        <div className="space-y-2">
          <Label>Join as</Label>

          <RadioGroup
            value={role}
            onValueChange={(value) => onRoleChange(value as ParticipantRole)}
            className="grid grid-cols-2 gap-2"
          >
            <Label
              htmlFor="role-operator"
              className={
                role === 'operator'
                  ? 'cursor-pointer rounded-lg border border-primary/50 bg-primary/10 p-3'
                  : 'cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/50'
              }
            >
              <RadioGroupItem id="role-operator" value="operator" />
              Operator
            </Label>

            <Label
              htmlFor="role-opm"
              className={
                role === 'operator_manager'
                  ? 'cursor-pointer rounded-lg border border-primary/50 bg-primary/10 p-3'
                  : 'cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/50'
              }
            >
              <RadioGroupItem id="role-opm" value="operator_manager" />
              OPM
            </Label>
          </RadioGroup>
        </div>

        {role === 'operator_manager' ? (
          <Button
            type="button"
            size="lg"
            disabled={isOpeningManager}
            onClick={onOpenManager}
            className="w-full"
          >
            {isOpeningManager ? 'Opening console...' : 'Open OPM console'}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
