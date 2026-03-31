import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';

@Component({
  selector: 'fo-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:24px; max-width:1200px; margin:0 auto; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      
      <div style="margin-bottom:32px;">
        <h1 style="font-size:32px; font-weight:800; color:#1d1d1f; margin:0 0 8px 0;">Welcome back, Player! 🔥</h1>
        <p style="color:#6e6e73; margin:0;">Ready to dominate the field today?</p>
      </div>

      <!-- Stats -->
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:32px;">
        <div *ngFor="let stat of stats" style="background:white; border-radius:16px; padding:20px; border:1px solid #e0e0e5;">
          <span style="font-size:28px;">{{stat.icon}}</span>
          <p style="font-size:28px; font-weight:800; color:#1d1d1f; margin:8px 0 4px 0;">{{stat.value}}</p>
          <p style="font-size:13px; color:#6e6e73; margin:0;">{{stat.label}}</p>
        </div>
      </div>

      <!-- Upcoming Matches -->
      <div style="background:white; border-radius:16px; padding:24px; border:1px solid #e0e0e5; margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#1d1d1f; margin:0 0 20px 0;">Upcoming Matches</h2>
        <div *ngFor="let match of upcomingMatches" style="background:#f5f5f7; border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="background:#e8f0fe; color:#0D6EFD; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600;">{{match.type}}</span>
            <h3 style="font-size:16px; font-weight:700; color:#1d1d1f; margin:8px 0 4px 0;">{{match.team1}} vs {{match.team2}}</h3>
            <p style="font-size:13px; color:#6e6e73; margin:2px 0;">📅 {{match.date}} at {{match.time}}</p>
            <p style="font-size:13px; color:#6e6e73; margin:2px 0;">📍 {{match.venue}}</p>
          </div>
          <button style="background:#000; color:white; border:none; padding:10px 20px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer;">View</button>
        </div>
      </div>

      <!-- Teams -->
      <div style="background:white; border-radius:16px; padding:24px; border:1px solid #e0e0e5;">
        <h2 style="font-size:20px; font-weight:700; color:#1d1d1f; margin:0 0 20px 0;">Your Teams</h2>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px;">
          <div *ngFor="let team of teams" style="background:#f5f5f7; border-radius:12px; padding:16px;">
            <div style="font-size:36px; margin-bottom:8px;">{{team.avatar}}</div>
            <h3 style="font-size:15px; font-weight:700; color:#1d1d1f; margin:0 0 4px 0;">{{team.name}}</h3>
            <p style="font-size:13px; color:#6e6e73; margin:2px 0;">👥 {{team.members}} members</p>
            <p style="font-size:13px; color:#6e6e73; margin:2px 0;">🏆 {{team.wins}}W - {{team.losses}}L</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class FrontofficeHomeComponent {
  stats = [
    { label: 'Matches Played', value: '48', icon: '🏆' },
    { label: 'Teams Joined', value: '5', icon: '👥' },
    { label: 'Win Rate', value: '67%', icon: '🎯' },
    { label: 'Points', value: '2,845', icon: '⭐' }
  ];

  upcomingMatches = [
    { type: 'Tournament', team1: 'Street Ballers', team2: 'Urban Warriors', date: '2026-02-15', time: '14:00', venue: 'Arena Sports Complex, Tunis' }
  ];

  teams = [
    { name: 'Street Ballers', sport: 'Football', members: 12, wins: 24, losses: 8, avatar: '⚽' }
  ];
}