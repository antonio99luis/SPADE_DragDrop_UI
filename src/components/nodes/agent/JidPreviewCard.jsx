// src/components/nodes/agent/JidPreviewCard.jsx
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { buildAvatarUrl } from '../../../utils/agentUtils';

export default function JidPreviewCard({ name, host }) {
  if (!name || !host) return null;
  const jid = `${name}@${host}`;
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Agent JID Preview:
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '16px' }}
          >
            {jid}
          </Typography>
        </Box>
        <Avatar src={buildAvatarUrl(jid)} alt="Agent Avatar" sx={{ width: 40, height: 40 }} />
      </CardContent>
    </Card>
  );
}
