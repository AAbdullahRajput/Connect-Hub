import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/post_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? profile;
  List<dynamic> posts = [];
  List<dynamic> followers = [];
  List<dynamic> following = [];
  bool loading = true;
  bool isFollowing = false;
  bool followLoading = false;
  bool followersLoading = false;
  int followersCount = 0;
  String? username;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final arg = ModalRoute.of(context)?.settings.arguments as String?;
    if (arg != null && arg != username) {
      username = arg;
      _loadProfile();
    }
  }

  Future<void> _loadProfile() async {
    setState(() => loading = true);
    try {
      final profileRes = await ApiService.getUserProfile(username!);
      final profileData = profileRes.data['user'] as Map<String, dynamic>;

      final postsRes = await ApiService.getAllPosts();
      final allPosts = postsRes.data['posts'] ?? [];
      final userPosts = (allPosts as List)
          .where((p) => p['user_id'] == profileData['id'])
          .toList();

      setState(() {
        profile = profileData;
        posts = userPosts;
        followersCount = profileData['followers_count'] ?? 0;
        loading = false;
      });

      final auth = context.read<AuthProvider>();
      if (auth.userId != profileData['id']) {
        try {
          final followRes = await ApiService.checkFollow(profileData['id']);
          setState(
              () => isFollowing = followRes.data['is_following'] ?? false);
        } catch (_) {}
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> _loadFollowers() async {
    if (profile == null) return;
    setState(() => followersLoading = true);
    try {
      final followersRes = await ApiService.getFollowers(profile!['id']);
      final followingRes = await ApiService.getFollowing(profile!['id']);
      setState(() {
        followers = followersRes.data['followers'] ?? [];
        following = followingRes.data['following'] ?? [];
        followersLoading = false;
      });
    } catch (e) {
      setState(() => followersLoading = false);
    }
  }

  Future<void> _toggleFollow() async {
    final profileId = profile?['id'];
    if (profileId == null || followLoading) return;
    setState(() => followLoading = true);
    try {
      if (isFollowing) {
        await ApiService.unfollowUser(profileId);
        setState(() {
          isFollowing = false;
          followersCount--;
        });
      } else {
        await ApiService.followUser(profileId);
        setState(() {
          isFollowing = true;
          followersCount++;
        });
      }
    } catch (e) {
      debugPrint('Follow error: $e');
    } finally {
      setState(() => followLoading = false);
    }
  }

  void _showFollowersSheet({required bool showFollowing}) {
    _loadFollowers();
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF18181B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return DraggableScrollableSheet(
              initialChildSize: 0.6,
              maxChildSize: 0.9,
              minChildSize: 0.4,
              expand: false,
              builder: (context, scrollController) {
                final list = showFollowing ? following : followers;
                return Column(
                  children: [
                    // Handle
                    Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3F3F46),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    // Title
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                      child: Row(
                        children: [
                          Text(
                            showFollowing ? 'Following' : 'Followers',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF27272A),
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: Text(
                              '${list.length}',
                              style: const TextStyle(
                                color: Color(0xFFA1A1AA),
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(color: Color(0xFF27272A), height: 1),
                    // List
                    Expanded(
                      child: followersLoading
                          ? const Center(
                              child: CircularProgressIndicator(
                                  color: Color(0xFF2563EB)))
                          : list.isEmpty
                              ? Center(
                                  child: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.center,
                                    children: [
                                      _SvgIcon(
                                        svgPath: _IconPaths.users,
                                        size: 48,
                                        color: const Color(0xFF3F3F46),
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        showFollowing
                                            ? 'Not following anyone yet'
                                            : 'No followers yet',
                                        style: const TextStyle(
                                          color: Color(0xFF71717A),
                                          fontSize: 15,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : ListView.builder(
                                  controller: scrollController,
                                  itemCount: list.length,
                                  itemBuilder: (context, index) {
                                    final u = list[index]
                                        as Map<String, dynamic>;
                                    return _UserListTile(user: u);
                                  },
                                ),
                    ),
                  ],
                );
              },
            );
          },
        );
      },
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return 'Joined ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final isOwn = auth.userId == profile?['id'];

    if (loading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF2563EB)),
        ),
      );
    }

    if (profile == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(
          child: Text('User not found',
              style: TextStyle(color: Color(0xFFF87171))),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          // ── SliverAppBar with cover ──────────────────────
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            backgroundColor: Colors.black,
            elevation: 0,
            leading: _CircleIconButton(
              onTap: () => Navigator.pop(context),
              child: const Icon(Icons.arrow_back,
                  color: Colors.white, size: 20),
            ),
            actions: [
              _CircleIconButton(
                onTap: () {},
                child: _SvgIcon(
                  svgPath: _IconPaths.moreHoriz,
                  size: 20,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Cover photo
                  profile?['cover_photo'] != null
                      ? Image.network(
                          profile!['cover_photo'],
                          fit: BoxFit.cover,
                          alignment: Alignment(
                            0,
                            ((profile?['cover_position'] ?? 50) - 50) /
                                50,
                          ),
                          errorBuilder: (_, __, ___) =>
                              _coverPlaceholder(),
                        )
                      : _coverPlaceholder(),

                  // Bottom gradient — blends into black
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.transparent,
                          Color(0xAA000000),
                          Colors.black,
                        ],
                        stops: [0.0, 0.55, 0.82, 1.0],
                      ),
                    ),
                  ),

                  // Top gradient — for button visibility
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Color(0x88000000),
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.35],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Profile info sliver ──────────────────────────
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar + action buttons row
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Avatar — pulled up over cover
                      Transform.translate(
                        offset: const Offset(0, -48),
                        child: _Avatar(
                          imageUrl: profile?['profile_picture'],
                          name: profile?['name'] ?? 'U',
                          size: 88,
                        ),
                      ),

                      const Spacer(),

                      // Buttons
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Row(
                          children: [
                            if (!isOwn)
                              _OutlineIconBtn(
                                onTap: () {},
                                child: _SvgIcon(
                                  svgPath: _IconPaths.mail,
                                  size: 17,
                                  color: Colors.white,
                                ),
                              ),
                            const SizedBox(width: 8),
                            isOwn
                                ? _PillButton(
                                    label: 'Edit Profile',
                                    onTap: () {},
                                    filled: false,
                                  )
                                : _PillButton(
                                    label: isFollowing
                                        ? 'Following'
                                        : 'Follow',
                                    onTap: followLoading
                                        ? null
                                        : _toggleFollow,
                                    filled: !isFollowing,
                                    loading: followLoading,
                                  ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Name + verified — compensate for avatar offset
                Transform.translate(
                  offset: const Offset(0, -32),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Name row
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                profile?['name'] ?? '',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                            if (followersCount >= 10) ...[
                              const SizedBox(width: 6),
                              _SvgIcon(
                                svgPath: _IconPaths.verified,
                                size: 20,
                                color: const Color(0xFF2563EB),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '@${profile?['username'] ?? ''}',
                          style: const TextStyle(
                            color: Color(0xFF71717A),
                            fontSize: 14,
                          ),
                        ),

                        // Bio
                        if (profile?['bio'] != null &&
                            profile!['bio'].toString().isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Text(
                            profile!['bio'],
                            style: const TextStyle(
                              color: Color(0xFFD4D4D8),
                              fontSize: 14,
                              height: 1.6,
                            ),
                          ),
                        ],

                        const SizedBox(height: 12),

                        // Meta row
                        Wrap(
                          spacing: 16,
                          runSpacing: 6,
                          children: [
                            if (profile?['location'] != null &&
                                profile!['location']
                                    .toString()
                                    .isNotEmpty)
                              _MetaItem(
                                icon: _IconPaths.location,
                                label: profile!['location'],
                              ),
                            if (profile?['website'] != null &&
                                profile!['website']
                                    .toString()
                                    .isNotEmpty)
                              _MetaItem(
                                icon: _IconPaths.link,
                                label: profile!['website'],
                                color: const Color(0xFF60A5FA),
                              ),
                            _MetaItem(
                              icon: _IconPaths.calendar,
                              label: _formatDate(profile?['created_at']),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),

                        // Stats row
                        Row(
                          children: [
                            _StatButton(
                              count: posts.length,
                              label: 'Posts',
                              onTap: null,
                            ),
                            const SizedBox(width: 28),
                            _StatButton(
                              count: followersCount,
                              label: 'Followers',
                              onTap: () => _showFollowersSheet(
                                  showFollowing: false),
                            ),
                            const SizedBox(width: 28),
                            _StatButton(
                              count:
                                  profile?['following_count'] ?? 0,
                              label: 'Following',
                              onTap: () => _showFollowersSheet(
                                  showFollowing: true),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),

                // Divider
                const Divider(color: Color(0xFF27272A), height: 1),

                // Tab bar
                TabBar(
                  controller: _tabController,
                  indicatorColor: const Color(0xFF2563EB),
                  indicatorWeight: 2,
                  labelColor: Colors.white,
                  unselectedLabelColor: const Color(0xFF52525B),
                  labelStyle: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                  tabs: const [
                    Tab(text: 'Posts'),
                    Tab(text: 'Liked'),
                  ],
                ),
              ],
            ),
          ),
        ],

        body: TabBarView(
          controller: _tabController,
          children: [
            // Posts
            posts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _SvgIcon(
                          svgPath: _IconPaths.noPost,
                          size: 52,
                          color: const Color(0xFF3F3F46),
                        ),
                        const SizedBox(height: 16),
                        const Text('No posts yet',
                            style: TextStyle(
                                color: Color(0xFF71717A),
                                fontSize: 16,
                                fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        const Text('Posts will appear here',
                            style: TextStyle(
                                color: Color(0xFF52525B),
                                fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding:
                        const EdgeInsets.fromLTRB(12, 12, 12, 24),
                    itemCount: posts.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) => PostCard(
                      post: posts[index],
                      onDelete: (id) => setState(
                          () => posts.removeWhere((p) => p['id'] == id)),
                    ),
                  ),

            // Liked placeholder
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _SvgIcon(
                    svgPath: _IconPaths.heart,
                    size: 52,
                    color: const Color(0xFF3F3F46),
                  ),
                  const SizedBox(height: 16),
                  const Text('Liked posts',
                      style: TextStyle(
                          color: Color(0xFF71717A),
                          fontSize: 16,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  const Text('Coming soon',
                      style: TextStyle(
                          color: Color(0xFF52525B), fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _coverPlaceholder() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0D0D1F), Color(0xFF1A1A3A), Color(0xFF0D0D1F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
    );
  }
}

// ─── SVG Icon Widget ──────────────────────────────────────
class _SvgIcon extends StatelessWidget {
  final String svgPath;
  final double size;
  final Color color;

  const _SvgIcon({
    required this.svgPath,
    required this.size,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _SvgPainter(svgPath: svgPath, color: color),
      ),
    );
  }
}

class _SvgPainter extends CustomPainter {
  final String svgPath;
  final Color color;

  _SvgPainter({required this.svgPath, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.08
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = _parsePath(svgPath, size);
    if (svgPath == _IconPaths.verified) {
      canvas.drawPath(path, fillPaint);
    } else {
      canvas.drawPath(path, paint);
    }
  }

  Path _parsePath(String d, Size size) {
    // Normalize from 24x24 viewBox to actual size
    final sx = size.width / 24;
    final sy = size.height / 24;
    final path = Path();

    if (d == _IconPaths.location) {
      path.moveTo(12 * sx, 2 * sy);
      path.addOval(Rect.fromCenter(
        center: Offset(12 * sx, 10 * sy),
        width: 6 * sx,
        height: 6 * sy,
      ));
      path.moveTo(12 * sx, 2 * sy);
      // Pin shape
      final pin = Path();
      pin.moveTo(12 * sx, 22 * sy);
      pin.cubicTo(12 * sx, 22 * sy, 5 * sx, 14 * sy, 5 * sx, 10 * sy);
      pin.arcToPoint(
        Offset(19 * sx, 10 * sy),
        radius: Radius.circular(7 * sx),
        largeArc: false,
      );
      pin.cubicTo(19 * sx, 14 * sy, 12 * sx, 22 * sy, 12 * sx, 22 * sy);
      return pin;
    }

    if (d == _IconPaths.calendar) {
      // Rectangle body
      path.addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(3 * sx, 4 * sy, 18 * sx, 17 * sy),
        Radius.circular(2 * sx),
      ));
      // Top lines
      path.moveTo(8 * sx, 2 * sy);
      path.lineTo(8 * sx, 6 * sy);
      path.moveTo(16 * sx, 2 * sy);
      path.lineTo(16 * sx, 6 * sy);
      // Horizontal divider
      path.moveTo(3 * sx, 9 * sy);
      path.lineTo(21 * sx, 9 * sy);
      return path;
    }

    if (d == _IconPaths.link) {
      path.moveTo(10 * sx, 13 * sy);
      path.cubicTo(10.8 * sx, 14.1 * sy, 12 * sx, 15 * sy,
          13.5 * sx, 15 * sy);
      path.lineTo(17 * sx, 15 * sy);
      path.cubicTo(19.2 * sx, 15 * sy, 21 * sx, 13.2 * sy,
          21 * sx, 11 * sy);
      path.cubicTo(21 * sx, 8.8 * sy, 19.2 * sx, 7 * sy,
          17 * sx, 7 * sy);
      path.lineTo(13.5 * sx, 7 * sy);
      path.cubicTo(12 * sx, 7 * sy, 10.8 * sx, 7.9 * sy,
          10 * sx, 9 * sy);

      path.moveTo(14 * sx, 11 * sy);
      path.cubicTo(13.2 * sx, 9.9 * sy, 12 * sx, 9 * sy,
          10.5 * sx, 9 * sy);
      path.lineTo(7 * sx, 9 * sy);
      path.cubicTo(4.8 * sx, 9 * sy, 3 * sx, 10.8 * sy,
          3 * sx, 13 * sy);
      path.cubicTo(3 * sx, 15.2 * sy, 4.8 * sx, 17 * sy,
          7 * sx, 17 * sy);
      path.lineTo(10.5 * sx, 17 * sy);
      path.cubicTo(12 * sx, 17 * sy, 13.2 * sy, 16.1 * sy,
          14 * sx, 15 * sy);
      return path;
    }

    if (d == _IconPaths.mail) {
      path.addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(2 * sx, 4 * sy, 20 * sx, 16 * sy),
        Radius.circular(2 * sx),
      ));
      path.moveTo(2 * sx, 7 * sy);
      path.lineTo(12 * sx, 13 * sy);
      path.lineTo(22 * sx, 7 * sy);
      return path;
    }

    if (d == _IconPaths.moreHoriz) {
      path.addOval(Rect.fromCenter(
          center: Offset(5 * sx, 12 * sy),
          width: 2 * sx, height: 2 * sy));
      path.addOval(Rect.fromCenter(
          center: Offset(12 * sx, 12 * sy),
          width: 2 * sx, height: 2 * sy));
      path.addOval(Rect.fromCenter(
          center: Offset(19 * sx, 12 * sy),
          width: 2 * sx, height: 2 * sy));
      final fill = Paint()
        ..color = color
        ..style = PaintingStyle.fill;
      return path;
    }

    if (d == _IconPaths.verified) {
      // Shield check shape
      final p = Path();
      p.moveTo(12 * sx, 2 * sy);
      p.lineTo(3 * sx, 6 * sy);
      p.lineTo(3 * sx, 12 * sy);
      p.cubicTo(3 * sx, 16.5 * sy, 7 * sx, 20.5 * sy, 12 * sx, 22 * sy);
      p.cubicTo(17 * sx, 20.5 * sy, 21 * sx, 16.5 * sy, 21 * sx, 12 * sy);
      p.lineTo(21 * sx, 6 * sy);
      p.close();
      return p;
    }

    if (d == _IconPaths.users) {
      path.moveTo(17 * sx, 21 * sy);
      path.cubicTo(17 * sx, 19 * sy, 14.8 * sx, 17 * sy, 12 * sx, 17 * sy);
      path.cubicTo(9.2 * sx, 17 * sy, 7 * sx, 19 * sy, 7 * sx, 21 * sy);
      path.moveTo(12 * sx, 14 * sy);
      path.addOval(Rect.fromCenter(
          center: Offset(12 * sx, 11 * sy),
          width: 6 * sx, height: 6 * sy));
      path.moveTo(23 * sx, 21 * sy);
      path.cubicTo(23 * sx, 19 * sy, 21.5 * sx, 17.5 * sy,
          19.5 * sx, 17 * sy);
      path.moveTo(19 * sx, 8 * sy);
      path.cubicTo(20.7 * sx, 8.5 * sy, 22 * sx, 10 * sy,
          22 * sx, 11.5 * sy);
      path.cubicTo(22 * sx, 13 * sy, 21 * sx, 14.3 * sy,
          19.5 * sx, 14.8 * sy);
      return path;
    }

    if (d == _IconPaths.heart) {
      path.moveTo(12 * sx, 21 * sy);
      path.cubicTo(12 * sx, 21 * sy, 3 * sx, 14 * sy, 3 * sx, 8.5 * sy);
      path.cubicTo(3 * sx, 5.4 * sy, 5.5 * sx, 3 * sy, 8.5 * sx, 3 * sy);
      path.cubicTo(10.2 * sx, 3 * sy, 11.7 * sx, 3.8 * sy,
          12 * sx, 5 * sy);
      path.cubicTo(12.3 * sx, 3.8 * sy, 13.8 * sx, 3 * sy,
          15.5 * sx, 3 * sy);
      path.cubicTo(18.5 * sx, 3 * sy, 21 * sx, 5.4 * sy,
          21 * sx, 8.5 * sy);
      path.cubicTo(21 * sx, 14 * sy, 12 * sx, 21 * sy, 12 * sx, 21 * sy);
      return path;
    }

    if (d == _IconPaths.noPost) {
      path.addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(3 * sx, 3 * sy, 18 * sx, 18 * sy),
        Radius.circular(2 * sx),
      ));
      path.moveTo(9 * sx, 9 * sy);
      path.lineTo(15 * sx, 15 * sy);
      path.moveTo(15 * sx, 9 * sy);
      path.lineTo(9 * sx, 15 * sy);
      return path;
    }

    return path;
  }

  @override
  bool shouldRepaint(_SvgPainter old) =>
      old.svgPath != svgPath || old.color != color;
}

// ─── Icon path constants ──────────────────────────────────
class _IconPaths {
  static const location = 'location';
  static const calendar = 'calendar';
  static const link = 'link';
  static const mail = 'mail';
  static const moreHoriz = 'more';
  static const verified = 'verified';
  static const users = 'users';
  static const heart = 'heart';
  static const noPost = 'nopost';
}

// ─── Avatar Widget ────────────────────────────────────────
class _Avatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double size;

  const _Avatar({
    required this.imageUrl,
    required this.name,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.black, width: 4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipOval(
        child: imageUrl != null
            ? Image.network(
                imageUrl!,
                fit: BoxFit.cover,
                width: size,
                height: size,
                errorBuilder: (_, __, ___) => _fallback(),
              )
            : _fallback(),
      ),
    );
  }

  Widget _fallback() {
    return Container(
      color: const Color(0xFF2563EB),
      child: Center(
        child: Text(
          name[0].toUpperCase(),
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.38,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

// ─── Circle Icon Button ───────────────────────────────────
class _CircleIconButton extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;

  const _CircleIconButton({required this.onTap, required this.child});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(8),
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.55),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Center(child: child),
      ),
    );
  }
}

// ─── Outline Icon Button ──────────────────────────────────
class _OutlineIconBtn extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;

  const _OutlineIconBtn({required this.onTap, required this.child});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFF3F3F46)),
          color: const Color(0xFF18181B),
        ),
        child: Center(child: child),
      ),
    );
  }
}

// ─── Pill Button ─────────────────────────────────────────
class _PillButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool filled;
  final bool loading;

  const _PillButton({
    required this.label,
    required this.onTap,
    required this.filled,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 38,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        decoration: BoxDecoration(
          color: filled ? const Color(0xFF2563EB) : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: filled
                ? const Color(0xFF2563EB)
                : const Color(0xFF3F3F46),
          ),
        ),
        child: Center(
          child: loading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }
}

// ─── Meta Item ────────────────────────────────────────────
class _MetaItem extends StatelessWidget {
  final String icon;
  final String label;
  final Color color;

  const _MetaItem({
    required this.icon,
    required this.label,
    this.color = const Color(0xFF71717A),
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _SvgIcon(svgPath: icon, size: 14, color: const Color(0xFF52525B)),
        const SizedBox(width: 5),
        Text(label, style: TextStyle(color: color, fontSize: 13)),
      ],
    );
  }
}

// ─── Stat Button ─────────────────────────────────────────
class _StatButton extends StatelessWidget {
  final int count;
  final String label;
  final VoidCallback? onTap;

  const _StatButton({
    required this.count,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$count',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: onTap != null
                  ? const Color(0xFFA1A1AA)
                  : const Color(0xFF71717A),
              fontSize: 13,
              decoration:
                  onTap != null ? TextDecoration.underline : null,
              decorationColor: const Color(0xFF52525B),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── User List Tile (followers sheet) ─────────────────────
class _UserListTile extends StatelessWidget {
  final Map<String, dynamic> user;

  const _UserListTile({required this.user});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        Navigator.pushNamed(
          context,
          '/profile',
          arguments: user['username'],
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            // Avatar
            ClipOval(
              child: user['profile_picture'] != null
                  ? Image.network(
                      user['profile_picture'],
                      width: 44,
                      height: 44,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _fallbackAvatar(),
                    )
                  : _fallbackAvatar(),
            ),
            const SizedBox(width: 12),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user['name'] ?? '',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '@${user['username'] ?? ''}',
                    style: const TextStyle(
                      color: Color(0xFF71717A),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            // Arrow
            const Icon(
              Icons.chevron_right,
              color: Color(0xFF3F3F46),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _fallbackAvatar() {
    return Container(
      width: 44,
      height: 44,
      color: const Color(0xFF2563EB),
      child: Center(
        child: Text(
          (user['name'] ?? 'U')[0].toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}