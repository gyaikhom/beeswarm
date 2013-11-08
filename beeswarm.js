/* Copyright 2013 Gagarine Yaikhom (The MIT License) */
(function() {
    Beeswarm = function(data, xaxis, radius) {
        this.data = data;
        this.xaxis = xaxis;
        this.radius = radius;
    }

    Beeswarm.prototype = {
        swarm: function() {
            var me = this, swarm = [], swarm_boundary = [],
            xaxis = me.xaxis, radius = me.radius,
            data = me.data, i, c = data.length;
            data.sort(get_comparator('y'));
            for (i = 0; i < c; ++i)
                swarm.push({
                    'x': get_x(i, data[i], swarm_boundary, xaxis, radius),
                    'y': data[i].y
                });
            return swarm;
        }
    };

    function find_intersections(circle, height) {
        var effective_height = height - circle.y,
        diameter = 2 * circle.radius;
        if (effective_height - diameter > 0)
            return undefined;

        var cx = circle.x, x = Math.sqrt(diameter * diameter
            - effective_height * effective_height), index = circle.index;
        return {
            'p1': {
                'index': index,
                'isEnd': false,
                'isValid': true,
                'x': cx + x,
                'y': height
            },
            'p2': {
                'index': index,
                'isEnd': false,
                'isValid': true,
                'x': cx - x,
                'y': height
            }
        };
    }

    function find_candidate_intervals(height, swarm_boundary) {
        var i = 0, c = swarm_boundary.length, possible_intervals = [];
        while (c--) {
            var isects = find_intersections(swarm_boundary[i], height);
            if (isects === undefined) {
                swarm_boundary.splice(i, 1);
                continue;
            }
            possible_intervals.push(isects.p1);
            possible_intervals.push(isects.p2);
            ++i;
        }
        return possible_intervals;
    }

    function get_comparator(p, q) {
        return function(a, b) {
            if (a[p] === b[p]) {
                if (q === undefined)
                    return 0;
                else {
                    if (a[q] === b[q])
                        return 0;
                    if (a[q] < b[q])
                        return -1;
                    return 1;
                }
            }
            if (a[p] < b[p])
                return -1;
            return 1;
        };
    }

    function remove_invalid_intervals(intervals) {
        var c = intervals.length, valid_intervals = [];
        if (c < 1)
            return valid_intervals;

        var i, j, k = c - 1;
        intervals.sort(get_comparator('x', 'index'));
        for (i = 0; i < k; ++i) {
            if (intervals[i].isEnd)
                continue;
            for (j = i + 1; j < c; ++j) {
                if (intervals[i].index === intervals[j].index) {
                    intervals[j].isEnd = true;
                    break;
                } else
                    intervals[j].isValid = false;
            }
        }
        for (i = 0; i < c; ++i)
            if (intervals[i].isValid)
                valid_intervals.push(intervals[i]);
        return valid_intervals;
    }

    function choose_x(intervals, xaxis) {
        var i, c = intervals.length, distance = [];
        for (i = 0; i < c; ++i) {
            distance.push({
                'i': i,
                'd': Math.abs(xaxis - intervals[i].x)
            });
        }
        distance.sort(get_comparator('d'));
        return intervals[distance[0].i].x;
    }

    function get_x(index, datum, swarm_boundary, xaxis, radius) {
        var x, y = datum.y,
        isects = find_candidate_intervals(y, swarm_boundary),
        preferred_choice = {
            'index': index,
            'isEnd': false,
            'isValid': true,
            'x': xaxis,
            'y': y
        };
        isects.push(preferred_choice);
        isects.push(preferred_choice);
        isects = remove_invalid_intervals(isects);
        x = choose_x(isects, xaxis);
        swarm_boundary.push({
            'index': index,
            'x': x,
            'y': y,
            'radius': radius
        });
        return x;
    }

})();
