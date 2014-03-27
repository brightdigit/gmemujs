#include <stdlib.h>
#include <stdio.h>
#include "gme.h"

const char* info_fmt = "{\"length\": %d, \"play_length\": %d, \"intro_length\": %d, \"loop_length\": %d, \"system\": \"%s\", \"game\": \"%s\", \"song\": \"%s\", \"author\": \"%s\", \"copyright\": \"%s\", \"comment\": \"%s\", \"dumper\": \"%s\"}";

static char json_str[2048];
static short audio_buffer[8192 * 2];
static Music_Emu* emu;
typedef struct AlbumBuilder
{
    int sample_rate;
    int buffer_size;
} AlbumBuilder;

typedef struct Album {
  AlbumBuilder* album_builder;
    int track_count;
} Album;

typedef struct Track {
    Album* album;
    int number;
} Track;

typedef struct PlayInfo
{
    AlbumBuilder * album_builder;
    Track * track;
} PlayInfo;
char* gmemujs_test () {
  return "hello world!";
}

AlbumBuilder * initialize (int sample_rate, int buffer_size) {
  AlbumBuilder * builder;
  builder = malloc(sizeof(AlbumBuilder));
  builder->sample_rate = sample_rate;
  builder->buffer_size = buffer_size;
  return builder;
}

Album * open_data (AlbumBuilder * builder, void const * data, long size) {
  Album * album;
  gme_open_data(data, size, &emu, builder->sample_rate);
  album = malloc(sizeof(Album));
  album->album_builder = builder;
  album->track_count = gme_track_count(emu);
  return album;
}

Track * open_track (Album * album, int track_number) {
  Track * track;
  track = malloc(sizeof(Track));
  track->album = album;
  track->number = track_number;
  return track;
}

char* track_info (Track * track) {
  gme_info_t * track_info;
  gme_track_info(emu, &track_info, track->number);
  sprintf(json_str, info_fmt, track_info->length,
    track_info->play_length, track_info->intro_length, track_info->loop_length,
    track_info->system, track_info->game, track_info->song, track_info->author,
    track_info->copyright, track_info->comment, track_info->dumper,
    track_info->loop_length, track_info->intro_length);
  return json_str;
}

int track_count (Album * album) {
  return album->track_count;
}


PlayInfo * play_info (Track * track) {
  PlayInfo * playinfo = malloc(sizeof(PlayInfo));
  playinfo->album_builder = track->album->album_builder;
  playinfo->track = track;
  return playinfo;
}

PlayInfo * track_start (Track * track) {
  PlayInfo * playinfo = play_info(track);
  gme_start_track(emu, track->number);
  return playinfo;
}

short * generate_sound_data (int buffer_size) {
  gme_play(emu, 8192 * 2, audio_buffer);
  return audio_buffer;
}
